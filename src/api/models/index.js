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


// Define relationships
User.hasOne(Cart);
Cart.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

Otp.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Review);
Review.belongsTo(User);

Category.hasMany(Product, { foreignKey: 'categoryId', onDelete: "RESTRICT" });
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

Order.hasOne(PaymentIntent);

PaymentIntent.belongsTo(Order, { foreignKey: "OrderId" });
PaymentIntent.belongsTo(User);


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
  Otp
};
