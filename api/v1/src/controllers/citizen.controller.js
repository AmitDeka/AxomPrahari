import * as UserModel from '../models/user.model.js';

// Masking Utilities
const maskPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\+\d{2})?\d{6}(\d{4})/, (match, country, last) => {
    const prefix = country || '';
    return `${prefix}******${last}`;
  });
};

const maskEmail = (email) => {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return '*****';
  if (local.length <= 2) {
    return `${local[0] || '*'}*@${domain}`;
  }
  const first = local[0];
  const last = local[local.length - 1];
  const masked = '*'.repeat(local.length - 2);
  return `${first}${masked}${last}@${domain}`;
};

const maskName = (name) => {
  if (!name) return '';
  return name.split(' ').map(part => {
    if (part.length <= 2) return part[0] + '*';
    const first = part[0];
    const last = part[part.length - 1];
    const masked = '*'.repeat(part.length - 2);
    return `${first}${masked}${last}`;
  }).join(' ');
};

const maskUsername = (username) => {
  if (!username) return '';
  if (username.length <= 2) {
    return `${username[0] || '*'}*`;
  }
  const first = username[0];
  const last = username[username.length - 1];
  const masked = '*'.repeat(username.length - 2);
  return `${first}${masked}${last}`;
};

export const getCitizenDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Ensure the user is a citizen and has a complete profile
    if (req.user.role !== 'citizen' || req.user.status !== 'complete') {
      return res.status(403).json({ 
        status: 'error',
        message: 'Access denied. Incomplete profile or invalid role.' 
      });
    }

    const userProfile = await UserModel.getUserProfileById(userId);

    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        title: 'Citizen Dashboard',
        user: userProfile
      }
    });
  } catch (error) {
    console.error('[getCitizenDashboard Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const citizenId = req.user.id;
    const { full_name, email } = req.body;

    const updatedUser = await UserModel.updateCitizenProfile(citizenId, { full_name, email });
    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Citizen profile not found.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully.',
      data: updatedUser
    });
  } catch (error) {
    console.error('[updateProfile Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllCitizensAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { citizens, totalCount } = await UserModel.getCitizensListWithStats(limit, offset);
    
    // Mask citizen details before sending
    const maskedCitizens = citizens.map(c => ({
      id: c.id,
      citizen_id: c.citizen_id,
      full_name: maskName(c.full_name),
      phone_number: maskPhone(c.phone_number),
      username: maskUsername(c.username),
      email: maskEmail(c.email),
      is_active: c.is_active,
      reward_points: c.reward_points,
      created_at: c.created_at,
      reports_stats: {
        pending: parseInt(c.pending_count, 10),
        accepted: parseInt(c.accepted_count, 10),
        rejected: parseInt(c.rejected_count, 10)
      }
    }));

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      status: 'success',
      data: {
        citizens: maskedCitizens,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('[getAllCitizensAdmin Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const disableCitizenAdmin = async (req, res) => {
  try {
    const citizenId = req.params.id;
    const { is_active } = req.body;

    const updatedUser = await UserModel.toggleUserActiveStatus(citizenId, is_active);
    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Citizen not found.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Citizen account has been successfully ${is_active ? 'enabled' : 'disabled'}.`,
      data: updatedUser
    });
  } catch (error) {
    console.error('[disableCitizenAdmin Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteCitizenAdmin = async (req, res) => {
  try {
    const citizenId = req.params.id;

    const deletedUser = await UserModel.deleteUserById(citizenId);
    if (!deletedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Citizen not found.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Citizen account has been permanently deleted.'
    });
  } catch (error) {
    console.error('[deleteCitizenAdmin Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
