import User from './User.js';
import Category from './Category.js';
import Product from './Product.js';
import Cart from './Cart.js';
import CartItem from './CartItem.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Review from './Review.js';
import PaymentIntent from './PaymentIntent.js'
import Otp from './Otp.js';
import { Role, Permission } from './RoleBasedAccess.js'
import Wishlist from './Wishlist.js';
import WishlistItem from './WishlistItem.js';

// Define relationships
User.hasOne(Cart, { foreignKey: "cartId"});
Cart.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

Otp.belongsTo(User, { foreignKey: 'userId' });

Category.hasMany(Product, { foreignKey: 'categoryId', onDelete: "RESTRICT" });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

CartItem.belongsTo(Cart, { foreignKey: 'CartId' });
CartItem.belongsTo(Product, { foreignKey: 'ProductId' });
Cart.hasMany(CartItem, { foreignKey: 'CartId' });

Product.hasMany(CartItem, { foreignKey: 'ProductId' });
CartItem.belongsTo(Product);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

Order.hasOne(PaymentIntent);

PaymentIntent.belongsTo(Order, { foreignKey: "OrderId" });
PaymentIntent.belongsTo(User);

Role.belongsToMany(Permission, { through: 'RolePermissions', foreignKey: 'roleId' });
Permission.belongsToMany(Role, { through: 'RolePermissions', foreignKey: 'permissionId' });

WishlistItem.belongsTo(Wishlist, { foreignKey: 'wishlistId' });
WishlistItem.belongsTo(Product, { foreignKey: 'productId' });
Wishlist.hasMany(WishlistItem, { foreignKey: 'wishlistId' });
User.hasOne(Wishlist, { foreignKey: "userId"});
User.hasMany(WishlistItem, { foreignKey: "userId"});

User.hasMany(Review, { foreignKey: "userId"});
Product.hasMany(Review, { foreignKey: "productId"});

export {
  User,
  Category,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Review,
  PaymentIntent,
  Otp,
  Role,
  Permission,
  Wishlist,
  WishlistItem,
};
