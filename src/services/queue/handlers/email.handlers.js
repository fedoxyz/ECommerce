import { EMAIL } from '../jobTypes.js';
import logger from '../../../utils/logger.js';

const sendOtpHandler = async (data) => {
  logger.debug(`Send OTP handler triggered with data: ${JSON.stringify(data)}`);
  try {
    
  } catch (error) {
    logger.error(`Error when scheduling sending otp: ${error.message}`);
    throw error;
  }
};

export default {
  [EMAIL.SEND_OTP]: sendOtpHandler,
};
