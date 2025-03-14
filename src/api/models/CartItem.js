import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  ProductId: {
    type: DataTypes.UUID,
    allowNull: false,  // Assuming a CartItem is always linked to a Product
  }
});

export default CartItem;

