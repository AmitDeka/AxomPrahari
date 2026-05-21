import * as NotificationModel from '../models/notification.model.js';

/**
 * Fetch notifications matching the logged-in admin's role and district jurisdiction
 */
export const getNotifications = async (req, res) => {
  try {
    const { role, jurisdiction_district } = req.user;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const notifications = await NotificationModel.getNotificationsForAdmin(
      role,
      jurisdiction_district,
      limit,
      offset
    );

    const unreadCount = await NotificationModel.getUnreadNotificationsCount(
      role,
      jurisdiction_district
    );

    res.status(200).json({
      status: 'success',
      data: {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit
        }
      }
    });
  } catch (error) {
    console.error('[getNotifications Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Mark a single notification as read
 */
export const markRead = async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id, 10);
    if (isNaN(notificationId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid notification ID.'
      });
    }

    const updated = await NotificationModel.markNotificationAsRead(notificationId);
    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read.',
      data: updated
    });
  } catch (error) {
    console.error('[markRead Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Mark all notifications in the admin's scope as read
 */
export const markAllRead = async (req, res) => {
  try {
    const { role, jurisdiction_district } = req.user;

    const count = await NotificationModel.markAllNotificationsAsRead(role, jurisdiction_district);

    res.status(200).json({
      status: 'success',
      message: `${count} notifications marked as read.`,
      count
    });
  } catch (error) {
    console.error('[markAllRead Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
