import User from './User.js';
import Category from './Category.js';
import Product from './Product.js';
import Cart from './Cart.js';
import CartItem from './CartItem.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Review from './Review.js';

// Define relationships
User.hasOne(Cart);
Cart.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Review);
Review.belongsTo(User);

Category.hasMany(Product);
Product.belongsTo(Category);

Product.hasMany(Review);
Review.belongsTo(Product);

Cart.hasMany(CartItem);
CartItem.belongsTo(Cart);

Product.hasMany(CartItem);
CartItem.belongsTo(Product);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

export {
  User,
  Category,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Review
};
