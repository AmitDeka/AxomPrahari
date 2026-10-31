import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.warn('⚠️ Cloudflare R2 environment variables are not fully configured.');
}

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Generates a presigned URL for a client to upload a file directly to Cloudflare R2.
 * @param {string} fileName - The desired name of the file to save.
 * @param {string} contentType - The MIME type of the file.
 * @returns {Promise<string>} The presigned upload URL.
 */
export const generateUploadUrl = async (fileName, contentType) => {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileName,
    ContentType: contentType,
  });

  // URL expires in 15 minutes (900 seconds)
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
  return signedUrl;
};

/**
 * Generates a presigned URL for a client to download/view a private file from Cloudflare R2.
 * @param {string} fileKey - The unique key of the file in R2.
 * @returns {Promise<string>} The presigned download URL.
 */
export const generateDownloadUrl = async (fileKey) => {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
  });

  // URL expires in 1 hour (3600 seconds)
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return signedUrl;
};

/**
 * Resolves a stored media_url path or key into a readable link.
 * If process.env.R2_BUCKET_PRIVATE is 'true', generates a presigned GET URL automatically.
 * @param {string} mediaUrl - The media URL or key.
 * @returns {Promise<string>} The readable media link.
 */
export const getReadableMediaUrl = async (mediaUrl) => {
  if (!mediaUrl) return '';

  const customDomain = process.env.R2_CUSTOM_DOMAIN || 'pub-r2.axomprahari.in';
  let fileKey = mediaUrl;

  if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
    try {
      const urlObj = new URL(mediaUrl);
      // Security Check: Only allow presigning for files hosted on our own R2 custom domain or R2 storage domain
      const isAllowedHost = 
        urlObj.hostname === customDomain || 
        urlObj.hostname.endsWith('.r2.cloudflarestorage.com');

      if (!isAllowedHost) {
        // Untrusted external domain - do not generate S3 download presigned URL
        return mediaUrl;
      }
      fileKey = urlObj.pathname.substring(1);
    } catch (e) {
      return mediaUrl;
    }
  }

  // Prevent path traversal
  fileKey = fileKey.replace(/\.\./g, '');

  if (process.env.R2_BUCKET_PRIVATE === 'true') {
    try {
      return await generateDownloadUrl(fileKey);
    } catch (error) {
      console.error('[R2 Presigned Read Error]', error.message);
      return mediaUrl; // Fallback to raw URL on failure
    }
  }

  return mediaUrl;
};
