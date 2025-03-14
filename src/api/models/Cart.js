import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  UserId: { // Add this field to link the cart with a user
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users', // Ensure the table name matches your actual User table
      key: 'id'
    }
  },
  // Optionally, add other fields like createdAt, updatedAt if they are not automatically added
}, {
  timestamps: true, // Enables createdAt and updatedAt
  paranoid: true, // If you want soft deletes
});


export default Cart;

