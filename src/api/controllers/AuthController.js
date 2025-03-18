import AuthService from '../services/AuthService.js';

class AuthController {
  async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body, req.ip);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
  
  async login(req, res, next) {
    try {
      const { email, password, otp } = req.body;
      const result = await AuthService.login(email, password, req.ip, otp);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { email, password, otp } = req.body;
      const result = await AuthService.passwordReset(email, password, otp);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      var result;
      if (req.user.isEmailVerified) {
        result = {message: "The email is already verified"}
      } else {
        const { otpCode } = req.body;
        result = await AuthService.verifyEmail(req.user.id, req.user.email, otpCode);
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();

