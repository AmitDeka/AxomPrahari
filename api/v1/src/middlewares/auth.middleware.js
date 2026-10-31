import jwt from 'jsonwebtoken';
import { isTokenInvalidated } from '../models/user.model.js';

/**
 * Middleware to extract Bearer token, verify JWT, check blacklist, and attach user to request.
 */
export const verifyToken = async (req, res, next) => {
  let token = req.cookies?.admin_token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Access denied. No authentication token provided.',
    });
  }

  try {
    // 1. Verify token signature and expiration in memory first (prevents DoS on DB)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Check if token is in the PostgreSQL Blacklist (Invalidated)
    const isBlacklisted = await isTokenInvalidated(token);
    if (isBlacklisted) {
      return res.status(401).json({
        status: 'error',
        message: 'Token has been invalidated. Please log in again.',
      });
    }

    // 3. Real-time active status and password change check for administrators
    if (decoded.role === 'police_admin' || decoded.role === 'super_admin') {
      const { findAdminById, getAdminPasswordChangedAt } = await import('../models/user.model.js');
      const dbAdmin = await findAdminById(decoded.id);

      if (!dbAdmin || dbAdmin.is_active === false) {
        return res.status(401).json({
          status: 'error',
          message: 'Admin account has been disabled or does not exist.',
        });
      }

      const dbPwd = await getAdminPasswordChangedAt(decoded.id);
      if (dbPwd && dbPwd.password_changed_at) {
        const pwdChangedTime = new Date(dbPwd.password_changed_at).getTime() / 1000;
        if (decoded.iat < pwdChangedTime) {
          return res.status(401).json({
            status: 'error',
            message: 'Session expired due to a recent password change. Please log in again.',
          });
        }
      }

      // Attach current district jurisdiction to decoded user context
      decoded.jurisdiction_district = dbAdmin.jurisdiction_district;
    }

    // 4. Real-time active status check for citizens
    if (decoded.role === 'citizen') {
      const { getUserProfileById } = await import('../models/user.model.js');
      const dbUser = await getUserProfileById(decoded.id);
      if (!dbUser || dbUser.is_active === false) {
        return res.status(401).json({
          status: 'error',
          message: 'Your account has been deactivated or does not exist.',
        });
      }
    }

    // Attach user and raw token to request
    req.user = decoded; 
    req.token = token;
    
    next();
  } catch (error) {
    console.error('[Auth Error]', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token has expired.',
      });
    }
    
    return res.status(403).json({
      status: 'error',
      message: 'Invalid or forged token.',
    });
  }
};

/**
 * Middleware to restrict access based on user role.
 * Must be used AFTER verifyToken.
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Insufficient privileges.',
      });
    }
    next();
  };
};
