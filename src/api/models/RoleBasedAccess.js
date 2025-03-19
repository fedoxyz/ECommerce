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

sequelize.afterSync(async () => {
  try {
    await Role.bulkCreate([
      { id: 0, name: 'guest' },
      { id: 1, name: 'customer' },
      { id: 6, name: 'admin' }
    ], {
      ignoreDuplicates: true
    });
    logger.info('Default roles created successfully');
  } catch (error) {
    logger.error('Error creating default roles:', error);
  }
});

