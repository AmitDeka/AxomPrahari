import { Router } from 'express';
import { 
  citizenRequestOtp, 
  citizenVerifyOtp, 
  citizenCompleteProfile, 
  citizenLogout,
  policeAdminLogin,
  adminLogout,
  getSetupStatus,
  setupInitialSuperAdmin
} from '../controllers/auth.controller.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { verifyToken, requireRole, restrictDemoAccount } from '../middlewares/auth.middleware.js';
import { 
  otpRateLimiter, 
  verifyOtpRateLimiter, 
  adminLoginRateLimiter 
} from '../middlewares/rateLimit.middleware.js';
import * as AuthValidator from '../middlewares/validators/auth.validator.js';

const router = Router();

// Citizen Routes
router.post(
  '/citizen/request-otp',
  otpRateLimiter,
  validateRequest(AuthValidator.requestOtpSchema),
  citizenRequestOtp
);

router.post(
  '/citizen/verify-otp',
  verifyOtpRateLimiter,
  validateRequest(AuthValidator.verifyOtpSchema),
  citizenVerifyOtp
);

router.post(
  '/citizen/complete-profile',
  verifyToken,
  restrictDemoAccount('Profile completion'),
  validateRequest(AuthValidator.completeProfileSchema),
  citizenCompleteProfile
);

router.post(
  '/citizen/logout',
  verifyToken,
  citizenLogout
);

// Admin Routes
router.get(
  '/admin/setup-status',
  getSetupStatus
);

router.post(
  '/admin/setup-initial',
  adminLoginRateLimiter,
  validateRequest(AuthValidator.setupInitialAdminSchema),
  setupInitialSuperAdmin
);

router.post(
  '/admin/login',
  adminLoginRateLimiter,
  validateRequest(AuthValidator.adminLoginSchema),
  policeAdminLogin
);

router.post(
  '/admin/logout',
  verifyToken,
  requireRole(['police_admin', 'super_admin']),
  adminLogout
);

export default router;
