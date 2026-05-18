import * as ViolationModel from '../models/violation.model.js';

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
    res.status(200).json({ status: 'success', data: updated });
  } catch (error) {
    console.error('[toggleViolation Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteViolation = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await ViolationModel.deleteViolation(id);
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Violation not found.' });
    }
    res.status(200).json({ status: 'success', message: 'Violation deleted successfully.' });
  } catch (error) {
    console.error('[deleteViolation Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
