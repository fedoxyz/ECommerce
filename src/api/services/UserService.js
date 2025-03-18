import UserRepository from '../repositories/UserRepository.js';

class UserService {
  async getUserProfile(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    };
  }
  
  async updateUserProfile(userId, userData) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Email uniqueness check if email is being updated
    if (userData.email && userData.email !== user.email) {
      const existingUser = await UserRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email already in use');
      }
    }
    
    const updatedUser = await UserRepository.update(userId, userData);
    return {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role
    };
  }
  
  async changePassword(user, oldPassword, newPassword) {
    if (!user) {
      throw new Error('User not found');
    }
    
    const isPasswordValid = await user.isValidPassword(oldPassword);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    
    await UserRepository.update(user.id, { password: newPassword });
    return { message: 'Password updated successfully' };
  }
}

export default new UserService();

