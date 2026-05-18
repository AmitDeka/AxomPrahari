import { Router } from 'express';
import { getAdminReportsList, reviewReport, getHeatmap } from '../controllers/report.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import * as ReportValidator from '../middlewares/validators/report.validator.js';

const router = Router();

// Protect all admin routes
router.use(verifyToken, requireRole(['police_admin', 'super_admin']));

// Get heatmap of accepted violation locations
router.get(
  '/heatmap',
  getHeatmap
);

// Get list of all reports (filterable by status, with pagination)
router.get(
  '/',
  getAdminReportsList
);

// Accept or reject a citizen violation report
router.patch(
  '/:id/review',
  validateRequest(ReportValidator.reviewReportSchema),
  reviewReport
);

export default router;
