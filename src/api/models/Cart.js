import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  }
});

export default Cart;
