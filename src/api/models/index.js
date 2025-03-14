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
Cart.belongsTo(User, { foreignKey: 'UserId' });

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Review);
Review.belongsTo(User);

Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

Product.hasMany(Review);
Review.belongsTo(Product);

CartItem.belongsTo(Cart, { foreignKey: 'CartId' });
CartItem.belongsTo(Product, { foreignKey: 'ProductId' });
Cart.hasMany(CartItem, { foreignKey: 'CartId' });

Product.hasMany(CartItem, { foreignKey: 'ProductId' });
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
