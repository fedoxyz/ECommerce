import CartRepository from '../repositories/CartRepository.js';
import ProductRepository from '../repositories/ProductRepository.js';

class CartService {
  async getCart(userId) {
    const cart = await CartRepository.findByUserId(userId);
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    return cart;
  }
  
  async addItemToCart(userId, productId, quantity) {
    // Check if product exists and has enough stock
    const product = await ProductRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }
    
    // Get or create user's cart
    let cart = await CartRepository.findByUserId(userId);
    if (!cart) {
      cart = await CartRepository.create({ UserId: userId });
    }
    
    return CartRepository.addItem(cart.id, productId, quantity, product.price);
  }
  
  async updateCartItem(userId, itemId, quantity) {
    const cart = await CartRepository.findByUserId(userId);
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    const cartItem = cart.CartItems.find(item => item.id === itemId);
    if (!cartItem) {
      throw new Error('Cart item not found');
    }
    
    // Check if the product has enough stock
    const product = await ProductRepository.findById(cartItem.ProductId);
    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }
    
    await CartRepository.updateItem(cart.id, itemId, quantity);
    return this.getCart(userId);
  }
  
  async removeCartItem(userId, itemId) {
    const cart = await CartRepository.findByUserId(userId);
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    await CartRepository.removeItem(cart.id, itemId);
    return this.getCart(userId);
  }
  
  async clearCart(userId) {
    const cart = await CartRepository.findByUserId(userId);
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    await CartRepository.clearCart(cart.id);
    return { message: 'Cart cleared successfully' };
  }
}

export default new CartService();

