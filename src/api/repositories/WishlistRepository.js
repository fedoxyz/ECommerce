import BaseRepository from './BaseRepository.js';
import { Wishlist, WishlistItem, Product } from '../models/index.js';

class WishlistRepository extends BaseRepository {
  constructor() {
    super(Wishlist);
  }

async findByUserId(userId) {
  try {
    // Find the cart by UserId, include associated CartItems and Products
    const wishlist = await this.model.findOne({
      where: { userId: userId },
      include: [
        {
          model: WishlistItem,
          include: [Product] // Ensure this association is correctly defined
        }
      ]
    });

    if (!wishlist) {
      throw new Error('Wishlist not found');
    }

    return wishlist;
  } catch (error) {
    throw error; // Rethrow the error so it can be handled elsewhere
  }
}

async findItemById(itemId) {
  try {
    let wishlistItem = await WishlistItem.findOne({
      where: {
        id: itemId
      },
    });

    if (!wishlistItem) {
      throw new Error('Item not found');
    }

    return wishlistItem;
  } catch (error) {
    throw error; // Rethrow the error so it can be handled elsewhere
  }
}


  async addItem(wishlistId, productId, userId) {
    try {
      let wishlistItem = await WishlistItem.findOne({
        where: {
          wishlistId: wishlistId,
          productId: productId
        },
      });

      if (wishlistItem) {
        throw new Error("The product already in the wishlist");
      } else {
        wishlistItem = await WishlistItem.create({
          wishlistId: wishlistId,
          productId: productId,
          userId: userId,
        });
      }

      return wishlistItem;
    } catch (error) {
      throw error;
    }
  }

  async removeItem(itemId) {
    return WishlistItem.destroy({
      where: {
        id: itemId,
      },
      returning:true,
    });
  }

}

export default new WishlistRepository();


