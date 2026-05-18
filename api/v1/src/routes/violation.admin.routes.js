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

// Protect all routes
router.use(verifyToken, requireRole(['police_admin', 'super_admin']));

router.get('/', getAdminViolations);

router.post(
  '/',
  validateRequest(ViolationValidator.createViolationSchema),
  addViolation
);

router.put(
  '/:id',
  validateRequest(ViolationValidator.updateViolationSchema),
  updateViolation
);

router.patch(
  '/:id/status',
  toggleViolation
);

router.delete(
  '/:id',
  requireRole(['super_admin']),
  deleteViolation
);

export default router;
