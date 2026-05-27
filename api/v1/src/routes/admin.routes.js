import { Router } from 'express';
import { createNewAdmin, deleteAdmin, toggleAdminStatus, updateAdmin, getAdminDashboard, getAllAdminsList } from '../controllers/admin.controller.js';
import { getFeedbacks } from '../controllers/feedback.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import * as AuthValidator from '../middlewares/validators/auth.validator.js';

const router = Router();

// Protect all routes with verifyToken
router.use(verifyToken);

// Dashboard route (accessible by police_admin and super_admin)
router.get(
  '/dashboard',
  requireRole(['police_admin', 'super_admin']),
  getAdminDashboard
);

// --- ADMIN CRUD ROUTES BELOW (Accessible by both Super Admin and Police Admin) ---
router.use(requireRole(['super_admin', 'police_admin']));

// Get all admins
router.get('/list', getAllAdminsList);

// Get all feedback (Admin)
router.get('/feedbacks', getFeedbacks);

// Create a new police admin
router.post(
  '/create',
  validateRequest(AuthValidator.createAdminSchema),
  createNewAdmin
);

// Delete a police admin
router.delete(
  '/:id',
  deleteAdmin
);

// Toggle is_active status
router.patch(
  '/:id/status',
  toggleAdminStatus
);

// Update admin profile (including password)
router.put(
  '/:id',
  validateRequest(AuthValidator.updateAdminSchema),
  updateAdmin
);

export default router;
