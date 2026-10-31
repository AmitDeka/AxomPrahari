import crypto from 'crypto';
import { generateUploadUrl } from '../utils/s3.util.js';

export const getPresignedUrl = async (req, res) => {
  try {
    const { fileType, folder = 'misc' } = req.query;

    if (!fileType) {
      return res.status(400).json({
        status: 'error',
        message: 'fileType query parameter is required (e.g. image/jpeg, video/mp4)'
      });
    }

    const ALLOWED_MIME_TYPES = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'video/mp4': 'mp4',
      'video/quicktime': 'mov'
    };

    const ALLOWED_FOLDERS = ['reports', 'feedback', 'misc'];

    // SEC-12: Disallow dangerous formats like image/svg+xml to prevent Stored XSS
    if (!ALLOWED_MIME_TYPES[fileType]) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or unsupported file type. Allowed formats: JPEG, PNG, WEBP, MP4, MOV.'
      });
    }

    // Validate folder against allowed list
    const requestedFolder = folder ? folder.toLowerCase().trim() : 'misc';
    const safeFolder = ALLOWED_FOLDERS.includes(requestedFolder) ? requestedFolder : 'misc';

    // Determine safe file extension
    const extension = ALLOWED_MIME_TYPES[fileType];
    const uniqueFileName = `${safeFolder}/${crypto.randomUUID()}.${extension}`;

    // Generate R2 presigned URL
    const uploadUrl = await generateUploadUrl(uniqueFileName, fileType);

    res.status(200).json({
      status: 'success',
      data: {
        uploadUrl,
        fileKey: uniqueFileName,
        fileUrl: `https://${process.env.R2_CUSTOM_DOMAIN || 'pub-r2.axomprahari.in'}/${uniqueFileName}`
      }
    });
  } catch (error) {
    console.error('[getPresignedUrl Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
