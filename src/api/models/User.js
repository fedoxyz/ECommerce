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
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  roles: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
    allowNull: false
  },
  lastVerifiedIps: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  emailsUsed: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
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
      // Handle password change
      if (user.changed('password') && user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    
      // Handle email change
      if (user.changed('email') && user.isEmailVerified) {
        user.isEmailVerified = false;
    
        // Add the old email to the emailsUsed array
        const updatedEmailsUsed = [...user.emailsUsed, user.previous("email")];
        user.setDataValue('emailsUsed', updatedEmailsUsed);
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
