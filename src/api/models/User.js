import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../../configs/database.js';
import ipRangeCheck from "ip-range-check";
import logger from '../../utils/logger.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('customer', 'admin'),
    defaultValue: 'customer'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastVerifiedIps: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      // Either log to see if this hook is being called at all
      console.log('beforeUpdate hook called', user.changed('password'));
      
      if (user.changed('password') && user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.isValidPassword = async function(password) {
  console.log(`${password} - password, ${this.password} - this password`)
  return await bcrypt.compare(password, this.password);
};

User.prototype.isOtpRequired = async function (ip, lastIps) {
  console.log(`${ip} - ${lastIps}`);

  if (ipRangeCheck(ip, lastIps)) {
    logger.debug("The OTP was not required on login")
    return false;
  }
  return true; // OTP required if IP doesn't match any range
};

export default User;
