import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';
import logger from '../../utils/logger.js';

export const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,  // Change from UUID to INTEGER
    autoIncrement: true,      // Enable auto-increment
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  }
});

export const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,  // Change from UUID to INTEGER
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  }
});

