import BaseRepository from './BaseRepository.js';
import { Cart, CartItem, Product } from '../models/index.js';

class CartRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }


async findByUserId(userId, transaction = null) {
  try {
    // Find the cart by UserId, include associated CartItems and Products
    const cart = await this.model.findOne({
      where: { UserId: userId },
      include: [
        {
          model: CartItem,
          include: [Product] // Ensure this association is correctly defined
        }
      ],
      transaction  // Pass transaction here if it is provided, otherwise, it will be null
    });

    // Handle the case when no cart is found
    if (!cart) {
      throw new Error('Cart not found');
    }

    return cart;
  } catch (error) {
    throw error; // Rethrow the error so it can be handled elsewhere
  }
}

  async addItem(cartId, productId, quantity, price, transaction) {
    try {
      let cartItem = await CartItem.findOne({
        where: {
          CartId: cartId,
          ProductId: productId
        },
        transaction
      });

      if (cartItem) {
        cartItem.quantity += quantity;
        await cartItem.save({ transaction });
      } else {
        cartItem = await CartItem.create({
          CartId: cartId,
          ProductId: productId,
          quantity,
          price
        }, { transaction });
      }

      return cartItem;
    } catch (error) {
      throw error;
    }
  }

  async updateItem(cartId, itemId, quantity) {
    return CartItem.update(
      { quantity },
      { 
        where: {
          id: itemId,
          CartId: cartId
        }
      }
    );
  }

  async removeItem(cartId, itemId, transaction) {
    return CartItem.destroy({
      where: {
        id: itemId,
        CartId: cartId
      },
      transaction
    });
  }

  async clearCart(cartId) {
    return CartItem.destroy({
      where: { CartId: cartId }
    });
  }

  async getCartTotal(cartId) {
    const result = await CartItem.sum('price * quantity', {
      where: { CartId: cartId }
    });
    return result || 0;
  }
}

export default new CartRepository();

