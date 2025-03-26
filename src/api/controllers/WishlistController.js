import WishlistService from '../services/WishlistService.js';

class WishlistController {
  async getWishlist(req, res, next) {
    try {
      const result = await WishlistService.getWishlist(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async addItem(req, res, next) {
    try {
      const { productId } = req.body;
      const result = await WishlistService.addItem(req.user.id, req.user.wishlistId, productId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req, res, next) {
    try {
      const { itemId } = req.body;
      const result = await WishlistService.removeItem(req.user.id, itemId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
  
export default new WishlistController();


