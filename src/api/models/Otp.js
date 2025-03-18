import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Otp = sequelize.define('Otp', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  otpHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  purpose: {
    type: DataTypes.ENUM('unrecognized-login', 'reset-password', 'otp-confirmation', 'email-verification'),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('email'),
    allowNull: false,
  },
  failCount: {
    type: DataTypes.INTEGER,
    defineValue: 0
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

export default Otp;
