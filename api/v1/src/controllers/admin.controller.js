import bcrypt from 'bcrypt';
import * as UserModel from '../models/user.model.js';

export const getAdminDashboard = async (req, res) => {
  try {
    const adminId = req.user.id;
    const adminProfile = await UserModel.getUserProfileById(adminId);

    if (!adminProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Admin profile not found.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: adminProfile
    });
  } catch (error) {
    console.error('[getAdminDashboard Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllAdminsList = async (req, res) => {
  try {
    const admins = await UserModel.getAllAdmins();
    res.status(200).json({
      status: 'success',
      data: admins || []
    });
  } catch (error) {
    console.error('[getAllAdminsList Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createNewAdmin = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'A user with this email already exists.'
      });
    }

    // Hash the secure password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create the new police_admin
    const newAdmin = await UserModel.createAdminUser(email, passwordHash, full_name, 'police_admin');

    res.status(201).json({
      status: 'success',
      message: 'Police Admin created successfully.',
      data: {
        id: newAdmin.id,
        email: newAdmin.email,
        full_name: newAdmin.full_name,
        role: newAdmin.role
      }
    });
  } catch (error) {
    console.error('[createNewAdmin Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;

    // Prevent super_admin from deleting themselves
    if (adminId == req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Super Admin cannot delete themselves.'
      });
    }

    const deletedAdmin = await UserModel.deleteAdminUser(adminId);

    if (!deletedAdmin) {
      return res.status(404).json({
        status: 'error',
        message: 'Police Admin not found or could not be deleted.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Police Admin deleted successfully.'
    });
  } catch (error) {
    console.error('[deleteAdmin Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const toggleAdminStatus = async (req, res) => {
  try {
    const adminId = req.params.id;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        status: 'error',
        message: 'is_active must be a boolean value.'
      });
    }

    // Prevent super_admin from disabling themselves
    if (adminId == req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Super Admin cannot disable themselves.'
      });
    }

    const updatedAdmin = await UserModel.updateAdminStatus(adminId, is_active);

    if (!updatedAdmin) {
      return res.status(404).json({
        status: 'error',
        message: 'Police Admin not found.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Police Admin has been ${is_active ? 'enabled' : 'disabled'}.`,
      data: {
        id: updatedAdmin.id,
        is_active: updatedAdmin.is_active
      }
    });
  } catch (error) {
    console.error('[toggleAdminStatus Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    const updateData = { ...req.body };

    // Check if user exists
    const admin = await UserModel.findAdminById(adminId);
    if (!admin) {
      return res.status(404).json({
        status: 'error',
        message: 'Admin not found.'
      });
    }

    if (updateData.password) {
      const saltRounds = 10;
      updateData.password_hash = await bcrypt.hash(updateData.password, saltRounds);
      delete updateData.password;
    }

    const updatedAdmin = await UserModel.updateAdminProfile(adminId, updateData);

    if (!updatedAdmin) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields provided to update.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Admin updated successfully.',
      data: {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        full_name: updatedAdmin.full_name,
        username: updatedAdmin.username,
        role: updatedAdmin.role
      }
    });
  } catch (error) {
    console.error('[updateAdmin Error]', error);
    // Postgres Unique Violation Error Code
    if (error.code === '23505') {
      return res.status(400).json({ 
        status: 'error',
        message: 'Email or Username is already in use.' 
      });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
