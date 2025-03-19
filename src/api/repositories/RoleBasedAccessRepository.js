import BaseRepository from './BaseRepository.js';
import { Role, Permission } from '../models/index.js';
import logger from '../../utils/logger.js';
import { Op } from 'sequelize';

class RoleBasedAccessRepository extends BaseRepository {
  constructor() {
    super(Role);
  }

  async checkPermissionsForRoles(roleIds, permissionNames) {
    try {
      // Ensure roleIds and permissionNames are always arrays
      const roleIdArray = Array.isArray(roleIds) ? roleIds : [roleIds];
      const permissionNameArray = Array.isArray(permissionNames) ? permissionNames : [permissionNames];
  
      const result = await this.model.findOne({
        where: { 
          id: { [Op.in]: roleIdArray }
        },
        include: [{
          model: Permission,
          where: { name: { [Op.in]: permissionNameArray } },
          required: true
        }],
        attributes: ['id']
      });
  
      return !!result;
    } catch (error) {
      logger.error('Error checking permissions:', error);
      throw error;
    }
  }

}

export default new RoleBasedAccessRepository();

