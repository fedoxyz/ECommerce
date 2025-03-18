import BaseRepository from './BaseRepository.js';
import { Otp } from '../models/index.js';

class OtpRepository extends BaseRepository {
  constructor() {
    super(Otp);
  }
  async incrementStock(productId, quantity, transaction = null) {
    const result = await this.model.increment('stock', {
      by: quantity,
      where: { id: productId },
      transaction // Automatically uses the passed transaction or null if not provided
    });

    console.log('Increment result:', result);

    return result;
  }

  async incrementFailCount(otpId) {
    await this.model.increment('failCount',{
      by: 1,
      where: {id: otpId}
    });
  }
}

export default new OtpRepository();

