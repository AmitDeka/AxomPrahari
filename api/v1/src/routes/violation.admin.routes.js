import { Router } from 'express';
import { 
  addViolation, 
  updateViolation, 
  deleteViolation, 
  toggleViolation, 
  getAdminViolations 
} from '../controllers/violation.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import * as ViolationValidator from '../middlewares/validators/violation.validator.js';

const router = Router();

// Protect all routes with authentication
router.use(verifyToken);

// View violations (accessible by both Police Admin and Super Admin)
router.get('/', requireRole(['police_admin', 'super_admin']), getAdminViolations);

// Statutory Master definition write actions (strictly restricted to Super Admin)
router.post(
  '/',
  requireRole(['super_admin']),
  validateRequest(ViolationValidator.createViolationSchema),
  addViolation
);

router.put(
  '/:id',
  requireRole(['super_admin']),
  validateRequest(ViolationValidator.updateViolationSchema),
  updateViolation
);

router.patch(
  '/:id/status',
  requireRole(['super_admin']),
  validateRequest(ViolationValidator.toggleViolationStatusSchema),
  toggleViolation
);

router.delete(
  '/:id',
  requireRole(['super_admin']),
  deleteViolation
);

export default router;
