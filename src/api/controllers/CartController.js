import CartService from '../services/CartService.js';

class CartController {
  async getCart(req, res, next) {
    try {
      const cart = await CartService.getCart(req.user.id);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  }
  
  async addItem(req, res, next) {
    try {
      const { productId, quantity } = req.body;
      const result = await CartService.addItemToCart(req.user.id, productId, quantity, req.user.email);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
  
  async updateItem(req, res, next) {
    try {
      const { quantity } = req.body;
      const cart = await CartService.updateCartItem(req.user.id, req.params.itemId, quantity);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  }
  
  async removeItem(req, res, next) {
    try {
      console.log(req.params.itemId)
      const cart = await CartService.removeCartItem(req.user.id, req.params.itemId);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  }
  
  async clearCart(req, res, next) {
    try {
      const result = await CartService.clearCart(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new CartController();

