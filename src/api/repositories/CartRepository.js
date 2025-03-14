import BaseRepository from './BaseRepository.js';
import { Cart, CartItem, Product } from '../models/index.js';
import sequelize from '../../configs/database.js';

class CartRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }

  async findByUserId(userId) {
    return this.model.findOne({
      where: { UserId: userId },
      include: [
        {
          model: CartItem,
          include: [Product]
        }
      ]
    });
  }

  async addItem(cartId, productId, quantity, price) {
    const transaction = await sequelize.transaction();
    
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

      await transaction.commit();
      return cartItem;
    } catch (error) {
      await transaction.rollback();
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

  async removeItem(cartId, itemId) {
    return CartItem.destroy({
      where: {
        id: itemId,
        CartId: cartId
      }
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

