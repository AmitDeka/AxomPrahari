import { Router } from 'express';
import { 
  getAllCitizensAdmin, 
  disableCitizenAdmin, 
  deleteCitizenAdmin 
} from '../controllers/citizen.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { toggleCitizenStatusSchema } from '../middlewares/validators/citizen.validator.js';

const router = Router();

// Retrieve all citizens with pagination and masked details (Police Admin & Super Admin)
router.get(
  '/',
  verifyToken,
  requireRole(['police_admin', 'super_admin']),
  getAllCitizensAdmin
);

// Toggle citizen's active status (Police Admin & Super Admin)
router.patch(
  '/:id/status',
  verifyToken,
  requireRole(['police_admin', 'super_admin']),
  validateRequest(toggleCitizenStatusSchema),
  disableCitizenAdmin
);

// Permanently delete a citizen account (Super Admin only)
router.delete(
  '/:id',
  verifyToken,
  requireRole(['super_admin']),
  deleteCitizenAdmin
);

export default router;
