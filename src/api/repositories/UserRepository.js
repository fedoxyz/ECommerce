import BaseRepository from './BaseRepository.js';
import { User } from '../models/index.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.model.findOne({ where: { email } });
  }
}

export default new UserRepository();
