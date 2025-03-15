import sequelize from '../../configs/database.js';
import { DataTypes } from 'sequelize';

const PaymentIntent = sequelize.define('PaymentIntent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  OrderId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true, 
  },
  status: {
    type: DataTypes.ENUM('pending', 'succeeded', 'canceled', 'failed'),
    defaultValue: 'pending'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

export default PaymentIntent;
