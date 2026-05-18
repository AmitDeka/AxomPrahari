import crypto from 'crypto';
import { generateUploadUrl } from '../utils/s3.util.js';

export const getPresignedUrl = async (req, res) => {
  try {
    const { fileType } = req.query;

    if (!fileType) {
      return res.status(400).json({
        status: 'error',
        message: 'fileType query parameter is required (e.g. image/jpeg, video/mp4)'
      });
    }

    // Validate that the request is for an image or a video
    if (!fileType.startsWith('image/') && !fileType.startsWith('video/')) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid file type. Only images and videos are allowed.'
      });
    }

    // Determine file extension
    const extension = fileType.split('/')[1] || 'bin';
    const uniqueFileName = `${crypto.randomUUID()}.${extension}`;

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
