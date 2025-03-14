class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(options = {}) {
    return this.model.findAll(options);
  }

  async findById(id, options = {}) {
    return this.model.findByPk(id, options);
  }

  async findOne(options = {}) {
    return this.model.findOne(options);
  }

  async create(data) {
    return this.model.create(data);
  }

  async update(id, data) {
    const [updated] = await this.model.update(data, {
      where: { id },
      returning: true
    });
    if (updated) {
      return this.findById(id);
    }
    return null;
  }

  async delete(id) {
    const deleted = await this.model.destroy({
      where: { id }
    });
    return deleted > 0;
  }

  async count(options = {}) {
    return this.model.count(options);
  }
}

export default BaseRepository;

