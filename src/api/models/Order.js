import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';
import PaymentIntent from './PaymentIntent.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed'),
    defaultValue: 'pending'
  },
  paymentIntentId: {
    type: DataTypes.UUID,
    references: {
      model: PaymentIntent,
      key: 'id'
    },
    allowNull: true
  },
  expirationTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: () => {
      let date = new Date();
      date.setMinutes(date.getMinutes() + 30);
      return date;
    }
  },
});

export default Order;
