import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  jobId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  timestamps: true, // Enables createdAt and updatedAt
  paranoid: true, // If you want soft deletes
});


export default Cart;

