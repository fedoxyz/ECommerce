import logger from "../../utils/logger.js";

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(options = {}) {
    return this.model.findAll({
      ...options,
      transaction: options.transaction || null 
    });
  }

  async findById(id, options = {}) {
    console.log("inside base repo findById");
    return this.model.findByPk(id, {
      ...options,
      transaction: options.transaction || null 
    });
  }

  async findOne(options = {}) {
    return this.model.findOne({
      ...options,
      transaction: options.transaction || null // 
    });
  }

  async create(data, options = {}) {
    return this.model.create(data, {
      ...options,
      transaction: options.transaction || null,
    });
  }

  async update(id, data, options = {}) {
    const [updated, resultData] = await this.model.update(data, {
      where: { id },
      returning: true,
      individualHooks: true,
      ...options,
      transaction: options.transaction || null 
    });
    if (updated) {
      const updatedInstance = resultData[0]; 
      console.log(updatedInstance.toJSON()); 
      return updatedInstance; 
    }
    return null;
  }

  async delete(id, options = {}) {
    const deleted = await this.model.destroy({
      where: { id },
      ...options,
      transaction: options.transaction || null 
    });
    return deleted > 0;
  }

  async count(options = {}) {
    return this.model.count({
      ...options,
      transaction: options.transaction || null 
    });
  }
}

export default BaseRepository;

