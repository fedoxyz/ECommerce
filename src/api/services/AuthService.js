import UserRepository from '../repositories/UserRepository.js';
import CartRepository from '../repositories/CartRepository.js'
import OtpRepository from '../repositories/OtpRepository.js';
import JobScheduler from '../../services/queue/scheduler.js';

import { Op } from 'sequelize';

import logger from '../../utils/logger.js';
import crypto from 'crypto';
import { generateToken } from "../../utils/jwt.js"

const MAX_OTP_ATTEMPTS = 8;
const OTP_EXPIRY_MINUTES = 30;
const MAX_LAST_VERIFIED_IPS = 9;
const OTP_PURPOSES = {'unrecognizedLogin': "Unrecognized login attempt detected", 
  'resetPassword': "Reset password confirmation", 
  'OTPConfirmation': "Action requires confirmation",
  'emailVerification': "Email verification confirmation",
  'emailChangingOld': "Email changing requires confirmation",
  'emailChangingNew': "New emails requires confirmation"};

class AuthService {
  async register(userData, ip) {
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }
    userData = {...userData,
      lastVerifiedIps: [ip],
      roles: [ 1 ]
    }
    const user = await UserRepository.create(userData);
    await CartRepository.create({ UserId: user.id });
    const token = generateToken(user);
    
    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: user.roles, 
        isEmailVerified: false,
      },
      token
    };
  }

  async login(email, password, ip, otp) {
    const user = await UserRepository.findByEmail(email);
    if (!user || !user.isActive) {
      return {message:'User not found or inactive'};
    }
    const isPasswordValid = await user.isValidPassword(password);

    if (!isPasswordValid) {
      return {message:'Invalid password or email.'};
    }
    const isOtpRequired = await user.isOtpRequired(ip, user.lastVerifiedIps);
    const purpose = "unrecognizedLogin";
    if (isOtpRequired && otp == "none" && ((!user.isEmailVerified && user.emailsUsed.length > 0) || (user.isEmailVerified))) {
      if (!user.isEmailVerified && user.emailsUsed.length > 0) {
        email = user.emailsUsed[user.emailsUsed.length - 1];
      }
      await this.sendOTP(user.id, email, purpose);
      return {message: "The OTP code is required and has been sent, please review your email."}
    } else if (isOtpRequired && otp != 'none') {
      try {
        if (!user.isEmailVerified && user.emailsUsed.length > 0) {
          email = user.emailsUsed[user.emailsUsed.length - 1];
        }
        const isVerified = await this.verifyOTP(email, otp, purpose);
        logger.debug(isVerified)
        if (!isVerified) {
          return {message: "The OTP code is invalid."};
      } 
        var lastVerifiedIps = user.lastVerifiedIps
        if (lastVerifiedIps.length >= MAX_LAST_VERIFIED_IPS) {
          lastVerifiedIps.shift(); 
        }
        lastVerifiedIps.push(ip); 
        await UserRepository.update(user.id, { lastVerifiedIps: lastVerifiedIps });
      } catch (error) {
        throw error; 
      }
    }
    // Generate token
    const token = generateToken(user);
    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      },
      token
    };
  }

  async sendOTP(userId, email, purpose) {
    if (!Object.keys(OTP_PURPOSES).includes(purpose)) {
      throw new Error("Purpose is invalid");
    }

    const recentAttempts = await this.getRecentOtpAttempts(userId);
    
    if (recentAttempts >= MAX_OTP_ATTEMPTS) {
      logger.debug("Too many attempts")
      throw new Error('Too many OTP attempts. Please try again later.');
    }

    // Generate 6-digit OTP code
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    
    // Hash the OTP for secure storage
    const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');
    
    // Store OTP in database
    await OtpRepository.create({
      email,
      userId,
      otpHash,
      purpose,
      isUsed: false,
      type: "email"
    });
    
    // Schedule email job without storing the actual OTP code
    await JobScheduler.scheduleJob(`email:send-otp`, {
      template: `otp.${purpose}`,
      to: email,
      otpCode,
      subject: OTP_PURPOSES[purpose]
    }, new Date());
    
    logger.debug(`OTP email scheduled for purpose: ${purpose} to ${email}`);
    
    return { message: `The OTP code was sent to ${email}.` };
  }

  async verifyOTP(email, otp, purpose) {
    // Hash the provided OTP
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
   
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - OTP_EXPIRY_MINUTES);
    // Find valid OTP records
    const validOtps = await OtpRepository.findAll({
      where: {
        email,
        purpose,
        isUsed: false,
        createdAt: { [Op.gt]: thirtyMinutesAgo }  // This line filters by creation time
      },
      order: [['createdAt', 'DESC']],
      limit: 1
    });
    
    if (validOtps.length === 0) {
      throw new Error("OTP code is incorrect");
    }
    
    const latestOtp = validOtps[0];
    
    // Check if the hashed OTP matches
    if (latestOtp.otpHash !== otpHash) {
      // Increment fail count for security monitoring
      await OtpRepository.incrementFailCount(latestOtp.id);
      throw new Error("OTP code is incorrect");
    }
    
    // Mark OTP as used to prevent reuse
    await OtpRepository.update(latestOtp.id, { isUsed: true });
    
    return true;
  }

  async passwordReset(email, password, otp) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return {message: "Invalid OTP code."}
    }
    if (otp=="send") {
      await this.sendOTP(user.id, email, 'resetPassword');
      return {message: "The OTP code was sent."}
    } else {
      const isVerified = await this.verifyOTP(email, otp, "resetPassword");
      if (!isVerified) {
        return {message: "Invalid OTP code."}
      }
      await UserRepository.update(user.id, { password: password });

      return {message: "Password was successfully reset."}
    }
  }

  async getRecentOtpAttempts(userId) {
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - OTP_EXPIRY_MINUTES);
    logger.debug(thirtyMinutesAgo) 
    // Count OTP records for this user in the time period
    const count = await OtpRepository.count({
      where: {
        userId,
        createdAt: { [Op.gt]: thirtyMinutesAgo }
      }
    });
    logger.debug(count);
    
    return count;
  }

  async verifyEmail(userId, email, otp) {
    try {
      if (otp == "send") {
        await this.sendOTP(userId, email, 'emailVerification');
        return {message: "Please check your email for verification."}
      }
      await this.verifyOTP(email, otp, 'emailVerification');
      
      // Mark email as verified
      await UserRepository.update(userId, { isEmailVerified: true });
      
      return { message: 'Email verified successfully' };
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();
