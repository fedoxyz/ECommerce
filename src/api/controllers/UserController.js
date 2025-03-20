import UserService from '../services/UserService.js';

class UserController {
  async getProfile(req, res, next) {
    try {
      const profile = await UserService.getUserProfile(req.user.id);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
  
  async updateProfile(req, res, next) {
    try {
      const user = req.user;
      const profile = await UserService.updateUserProfile(user, req.body);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
  
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await UserService.changePassword(req.user, currentPassword, newPassword);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async changeEmail(req, res, next) {
    try {
      const { newEmail, otps } = req.body;
      const result = await UserService.changeEmail(req.user, newEmail, otps);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();

