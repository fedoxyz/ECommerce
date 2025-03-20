import { EMAIL } from '../jobTypes.js';
import logger from '../../../utils/logger.js';
import { renderEmailTemplate, sendEmail } from "../../email/emailService.js"

const sendOtpHandler = async (data) => {
  logger.debug(`Send OTP handler triggered with data: ${JSON.stringify(data)}`);
  try {
    const emailData = {otpCode: data.otpCode};
    const subject = data.subject;
    const from = process.env.EMAIL_SECURITY_ADDRESS
    logger.debug(`from ${from}`)
    const html = renderEmailTemplate(data.template, emailData)
    await sendEmail({to: data.to, subject, html, from})
  } catch (error) {
    logger.error(`Error when scheduling sending otp: ${error.stack}`);
    throw error;
  }
};

const orderCreatedHandler = async (data) => {
  logger.debug(`orderCreated handler triggered with data: ${JSON.stringify(data)}`);
  try {
    const emailData = { orderItems: data.orderItems, totalAmount: data.totalAmount}
    const subject = data.subject;
    const from = process.env.EMAIL_MANAGEMENT_ADDRESS
    const html = renderEmailTemplate(data.template, emailData)
    await sendEmail({to: data.to, subject, html, from})
  } catch (error) {
      logger.error(`Error when scheduling sending email about order creation ${error.stack}`);
      throw error;
  }
};


const cartAbandonedHandler = async (data) => {
  logger.debug(`Cart abandoned handler triggered with data: ${JSON.stringify(data)}`);
  try {
    const emailData = { cartItems: data.cartItems }
    const subject = data.subject;
    const from = process.env.EMAIL_MANAGEMENT_ADDRESS
    const html = renderEmailTemplate(data.template, emailData)
    await sendEmail({to: data.to, subject, html, from})
  } catch (error) {
      logger.error(`Error when scheduling sending email about order creation ${error.stack}`);
      throw error;
  }
};

export default {
  [EMAIL.SEND_OTP]: sendOtpHandler,
  [EMAIL.ORDER_CREATED]: orderCreatedHandler,
  [EMAIL.CART_ABANDONED]: cartAbandonedHandler
};
