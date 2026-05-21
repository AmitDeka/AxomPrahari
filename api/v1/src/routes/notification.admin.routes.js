import { Router } from 'express';
import { getNotifications, markRead, markAllRead } from '../controllers/notification.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all notification routes to verified admins
router.use(verifyToken);
router.use(requireRole(['super_admin', 'police_admin']));

// Get all notifications for current admin scope
router.get('/', getNotifications);

// Mark a single notification as read
router.patch('/:id/read', markRead);

// Mark all notifications in scope as read
router.post('/mark-all-read', markAllRead);

export default router;
