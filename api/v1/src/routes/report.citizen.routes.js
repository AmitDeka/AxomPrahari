import { Router } from 'express';
import { submitReport, getCitizenReportsList } from '../controllers/report.controller.js';
import { getPresignedUrl } from '../controllers/upload.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { presignedUrlRateLimiter, reportRateLimiter } from '../middlewares/rateLimit.middleware.js';
import * as ReportValidator from '../middlewares/validators/report.validator.js';

const router = Router();

// Protect all routes in citizen reports
router.use(verifyToken);

// Generate presigned upload URL (spam limited)
router.get(
  '/presigned-url',
  presignedUrlRateLimiter,
  getPresignedUrl
);

// Submit a new violation report (spam limited)
router.post(
  '/',
  reportRateLimiter,
  validateRequest(ReportValidator.createReportSchema),
  submitReport
);

// Get pagination lists of their own reports
router.get(
  '/',
  getCitizenReportsList
);

export default router;
