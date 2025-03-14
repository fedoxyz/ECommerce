import UserRepository from '../repositories/UserRepository.js';
import CartRepository from '../repositories/CartRepository.js';
import { generateToken } from '../../utils/jwt.js';

class AuthService {
  async register(userData) {
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }
    
    const user = await UserRepository.create(userData);
    
    // Create cart for the user
    await CartRepository.create({ UserId: user.id });
    
    // Generate token
    const token = generateToken(user);
    
    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      token
    };
  }
  
  async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }
    
    const isPasswordValid = await user.isValidPassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    
    // Generate token
    const token = generateToken(user);
    
    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      token
    };
  }
}

export default new AuthService();

