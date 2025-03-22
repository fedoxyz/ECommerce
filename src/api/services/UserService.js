import {BadRequestError, ForbiddenError} from '../../utils/errors.js';
import UserRepository from '../repositories/UserRepository.js';
import AuthService from './AuthService.js';

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
      roles: user.roles
    };
  }
  
  async updateUserProfile(user, userData) {
    const updatedUser = await UserRepository.update(user.id, userData);
    if (!updatedUser) {
      return {message: "User is not updated."}
    }
    return {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
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

  async changeEmail(user, newEmail, otps) {
    if (user.email == newEmail) {
      throw new BadRequestError("New email is the same.")
    }

    const existingUser = await UserRepository.findByEmail(newEmail)
    if (existingUser) {
      throw new BadRequestError("User with this email already exists")
    }
    const purposeOld = "emailChangingOld";
    const purposeNew = "emailChangingNew";
    if (otps == "send") {
      await AuthService.sendOTP(user.id, user.email, purposeOld);
      await AuthService.sendOTP(user.id, newEmail, purposeNew);
      return {status: "success",message: "The OTP codes were sent to both emails."}
    } else {
        const otpsSep = otps.split("-")
        const otpOld = otpsSep[0]; 
        const otpNew = otpsSep[1];
        const isVerifiedOld = await AuthService.verifyOTP(user.email, otpOld, purposeOld);
        const isVerifiedNew = await AuthService.verifyOTP(newEmail, otpNew, purposeNew);
        if (!isVerifiedOld && !isVerifiedNew) {
          throw new ForbiddenError("The OTP codes are incorrect");
        }
    }
    await UserRepository.update(user.id, { email: newEmail });
    return { status: "success", message: 'Email changed successfully' };
  }
}

export default new UserService();

