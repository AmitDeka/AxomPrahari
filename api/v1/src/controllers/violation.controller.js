import * as ViolationModel from '../models/violation.model.js';
import { createNotification } from '../models/notification.model.js';

export const getAdminViolations = async (req, res) => {
  try {
    const violations = await ViolationModel.getAllViolations(true);
    res.status(200).json({ status: 'success', data: violations });
  } catch (error) {
    console.error('[getAdminViolations Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getCitizenViolations = async (req, res) => {
  try {
    if (req.user.status !== 'complete') {
      return res.status(403).json({
        status: 'error',
        message: 'You must complete your profile to view this information.'
      });
    }

    const violations = await ViolationModel.getAllViolations(false);
    res.status(200).json({ status: 'success', data: violations });
  } catch (error) {
    console.error('[getCitizenViolations Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const addViolation = async (req, res) => {
  try {
    const newViolation = await ViolationModel.createViolation(req.body);
    
    // Dispatch notification
    try {
      await createNotification({
        recipientRole: 'all',
        title: 'New Violation Type Added',
        message: `A new violation type "${newViolation.offence_name}" (${newViolation.mv_act_code}) was added by ${req.user.full_name || req.user.email}.`,
        type: 'settings_change',
        relatedId: newViolation.id
      });
    } catch (notifError) {
      console.error('[Notification Hook Error in addViolation]', notifError);
    }

    res.status(201).json({ status: 'success', data: newViolation });
  } catch (error) {
    console.error('[addViolation Error]', error);
    if (error.code === '23505') {
      return res.status(400).json({ status: 'error', message: 'MV Act Code already exists.' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateViolation = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await ViolationModel.getViolationById(id);
    if (!existing) {
      return res.status(404).json({ status: 'error', message: 'Violation not found.' });
    }

    const updated = await ViolationModel.updateViolation(id, req.body);

    // Dispatch notification
    try {
      await createNotification({
        recipientRole: 'all',
        title: 'Violation Type Updated',
        message: `Violation type "${updated.offence_name}" (${updated.mv_act_code}) was modified by ${req.user.full_name || req.user.email}.`,
        type: 'settings_change',
        relatedId: updated.id
      });
    } catch (notifError) {
      console.error('[Notification Hook Error in updateViolation]', notifError);
    }

    res.status(200).json({ status: 'success', data: updated });
  } catch (error) {
    console.error('[updateViolation Error]', error);
    if (error.code === '23505') {
      return res.status(400).json({ status: 'error', message: 'MV Act Code already exists.' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const toggleViolation = async (req, res) => {
  try {
    const id = req.params.id;
    const { is_active } = req.body;
    
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ status: 'error', message: 'is_active must be a boolean.' });
    }

    const updated = await ViolationModel.toggleViolationStatus(id, is_active);
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Violation not found.' });
    }

    // Dispatch notification
    try {
      await createNotification({
        recipientRole: 'all',
        title: `Violation Type ${is_active ? 'Enabled' : 'Disabled'}`,
        message: `Violation type "${updated.offence_name}" was ${is_active ? 'enabled' : 'disabled'} by ${req.user.full_name || req.user.email}.`,
        type: 'settings_change',
        relatedId: updated.id
      });
    } catch (notifError) {
      console.error('[Notification Hook Error in toggleViolation]', notifError);
    }

    res.status(200).json({ status: 'success', data: updated });
  } catch (error) {
    console.error('[toggleViolation Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteViolation = async (req, res) => {
  try {
    const id = req.params.id;
    // Get info before deleting for notification
    const existing = await ViolationModel.getViolationById(id);
    const deleted = await ViolationModel.deleteViolation(id);
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Violation not found.' });
    }

    // Dispatch notification
    try {
      await createNotification({
        recipientRole: 'all',
        title: 'Violation Type Deleted',
        message: `Violation type "${existing?.offence_name || id}" was deleted by ${req.user.full_name || req.user.email}.`,
        type: 'settings_change',
        relatedId: parseInt(id, 10)
      });
    } catch (notifError) {
      console.error('[Notification Hook Error in deleteViolation]', notifError);
    }

    res.status(200).json({ status: 'success', message: 'Violation deleted successfully.' });
  } catch (error) {
    console.error('[deleteViolation Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
