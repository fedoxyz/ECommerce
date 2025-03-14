import { verifyToken } from '../../utils/jwt.js';
import { User } from '../models/index.js';

// Middleware to check if the user is authenticated
const authenticate = async (req, res, next) => {
  console.log("Inside authenticate")
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
    
    console.log("exeuting findByPk inside authenticate")
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

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  console.log("inside isAdmin req.user", req.user)
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

export { authenticate, isAdmin };

