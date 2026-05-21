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
    const { email, password, full_name, role, rank, jurisdiction_district } = req.body;

    // Security check: police_admin cannot create super_admin
    if (req.user.role === 'police_admin' && role === 'super_admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Police Admins cannot create Super Admins.'
      });
    }

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

    // Create the new admin with role, rank, and jurisdiction_district
    const newAdmin = await UserModel.createAdminUser(
      email,
      passwordHash,
      full_name,
      role || 'police_admin',
      rank,
      jurisdiction_district
    );

    res.status(201).json({
      status: 'success',
      message: 'Admin created successfully.',
      data: {
        id: newAdmin.id,
        email: newAdmin.email,
        full_name: newAdmin.full_name,
        role: newAdmin.role,
        rank: newAdmin.rank,
        jurisdiction_district: newAdmin.jurisdiction_district
      }
    });
  } catch (error) {
    console.error('[createNewAdmin Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const adminId = parseInt(req.params.id, 10);
    const loggedInUserId = parseInt(req.user.id, 10);

    // Prevent any admin from deleting themselves
    if (adminId === loggedInUserId) {
      return res.status(403).json({
        status: 'error',
        message: 'You cannot delete yourself.'
      });
    }

    // Check target user exists
    const targetAdmin = await UserModel.findAdminById(adminId);
    if (!targetAdmin) {
      return res.status(404).json({
        status: 'error',
        message: 'Admin not found.'
      });
    }

    // Security check: police_admin cannot delete super_admin
    if (req.user.role === 'police_admin' && targetAdmin.role === 'super_admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Police Admins cannot delete Super Admins.'
      });
    }

    const deletedAdmin = await UserModel.deleteAdminUser(adminId);

    if (!deletedAdmin) {
      return res.status(404).json({
        status: 'error',
        message: 'Admin not found or could not be deleted.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Admin deleted successfully.'
    });
  } catch (error) {
    console.error('[deleteAdmin Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const toggleAdminStatus = async (req, res) => {
  try {
    const adminId = parseInt(req.params.id, 10);
    const loggedInUserId = parseInt(req.user.id, 10);
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        status: 'error',
        message: 'is_active must be a boolean value.'
      });
    }

    // Prevent any admin from disabling themselves
    if (adminId === loggedInUserId) {
      return res.status(403).json({
        status: 'error',
        message: 'You cannot disable yourself.'
      });
    }

    // Check target user exists
    const targetAdmin = await UserModel.findAdminById(adminId);
    if (!targetAdmin) {
      return res.status(404).json({
        status: 'error',
        message: 'Admin not found.'
      });
    }

    // Security check: police_admin cannot disable super_admin
    if (req.user.role === 'police_admin' && targetAdmin.role === 'super_admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Police Admins cannot disable Super Admins.'
      });
    }

    const updatedAdmin = await UserModel.updateAdminStatus(adminId, is_active);

    if (!updatedAdmin) {
      return res.status(404).json({
        status: 'error',
        message: 'Admin not found.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Admin has been ${is_active ? 'enabled' : 'disabled'}.`,
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
    const adminId = parseInt(req.params.id, 10);
    const loggedInUserId = parseInt(req.user.id, 10);
    const updateData = { ...req.body };

    // Check if target exists
    const targetAdmin = await UserModel.findAdminById(adminId);
    if (!targetAdmin) {
      return res.status(404).json({
        status: 'error',
        message: 'Admin not found.'
      });
    }

    // Security checks if logged-in user is a police_admin
    if (req.user.role === 'police_admin') {
      // Cannot modify a super admin
      if (targetAdmin.role === 'super_admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Police Admins cannot modify Super Admins.'
        });
      }
      // Cannot promote anyone to super admin
      if (updateData.role === 'super_admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Police Admins cannot promote anyone to Super Admin.'
        });
      }
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
        role: updatedAdmin.role,
        rank: updatedAdmin.rank,
        jurisdiction_district: updatedAdmin.jurisdiction_district
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
