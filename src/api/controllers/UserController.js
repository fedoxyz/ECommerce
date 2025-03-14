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
      const profile = await UserService.updateUserProfile(req.user.id, req.body);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
  
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await UserService.changePassword(req.user, currentPassword, newPassword);
      console.log("after getting result in changePassword in controllers")
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();

