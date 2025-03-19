import { verifyToken } from '../../utils/jwt.js';
import { User } from '../models/index.js';
import RoleBasedAccessRepository from '../repositories/RoleBasedAccessRepository.js';

const authorize = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Check if user has the 'admin' role (global override)
      const isAdmin = req.user.roles.includes(6);
      if (isAdmin) return next(); // Admin bypasses all permission checks
      
      const hasPermission = await RoleBasedAccessRepository.checkPermissionsForRoles(
        req.user.roles,
        requiredPermissions
      );

      if (!hasPermission) {
        return res.status(403).json({ message: 'Access denied' });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Middleware to check if the user is authenticated
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    next(error);
  }
};

export { authenticate, authorize };

