import BaseRepository from "./BaseRepository.js";
import PaymentIntent from "../models/PaymentIntent.js";

class PaymentRepository extends BaseRepository {
  constructor() {
    super(PaymentIntent);
  }
}

export default new PaymentRepository();
