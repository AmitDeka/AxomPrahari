import { Router } from 'express';
import { getCitizenDashboard, updateProfile } from '../controllers/citizen.controller.js';
import { submitFeedback } from '../controllers/feedback.controller.js';
import { getCitizenViolations } from '../controllers/violation.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { feedbackRateLimiter } from '../middlewares/rateLimit.middleware.js';
import { updateProfileSchema, createFeedbackSchema } from '../middlewares/validators/citizen.validator.js';

const router = Router();

// Protected Citizen Dashboard Route
// This route is protected by the verifyToken middleware
router.get(
  '/dashboard',
  verifyToken,
  getCitizenDashboard
);

// Get Active Violations Master list (without fine amounts)
router.get(
  '/violations',
  verifyToken,
  getCitizenViolations
);

// Update citizen profile name and email
router.put(
  '/profile',
  verifyToken,
  validateRequest(updateProfileSchema),
  updateProfile
);

// Submit citizen feedback
router.post(
  '/feedback',
  verifyToken,
  feedbackRateLimiter,
  validateRequest(createFeedbackSchema),
  submitFeedback
);

export default router;
