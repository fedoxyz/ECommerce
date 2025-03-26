import WishlistRepository from '../repositories/WishlistRepository.js';
import { NotFoundError } from '../../utils/errors.js';

class WishlistService {
  async getWishlist(userId) {
    // Fetch the wishlist items for a user
    const wishlist = await WishlistRepository.findByUserId(userId);
    console.log(wishlist) 
    if (!wishlist.WishlistItems || wishlist.WishlistItems.length === 0) {
      throw new NotFoundError('Wishlist is empty or not found');
    }

    return {
      userId,
      wishlist: wishlist,
      };
    };

  async addItem(userId, wishlistId, productId) {
    // Add the product to the wishlist
    const newItem = await WishlistRepository.addItem(wishlistId, productId, userId);
    if (!newItem) {
      throw new Error('Failed to add item to wishlist');
    }

    return { message: 'Product added to wishlist successfully', item: newItem };
  }

  async removeItem(userId, itemId) {
    // Check if the item exists in the wishlist
    const existingItem = await WishlistRepository.findItemById(itemId);
    if (!existingItem || existingItem.userId !== userId) {
      throw new Error('Item not found or does not belong to the user');
    }

    // Remove the item from the wishlist
    const removedItem = await WishlistRepository.removeItem(existingItem.id);
    if (!removedItem) {
      throw new Error('Failed to remove item from wishlist');
    }
    console.log(removedItem)

    return { message: 'Product removed from wishlist successfully', itemId};
  }
}

export default new WishlistService();

