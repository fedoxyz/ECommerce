import BaseRepository from './BaseRepository.js';
import { Otp } from '../models/index.js';

class OtpRepository extends BaseRepository {
  constructor() {
    super(Otp);
  }

  async incrementFailCount(otpId) {
    await this.model.increment('failCount',{
      by: 1,
      where: {id: otpId}
    });
  }
}

export default new OtpRepository();

