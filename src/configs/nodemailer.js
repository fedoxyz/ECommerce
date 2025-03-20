import nodemailer from "nodemailer";
import dotenv from "dotenv";
import logger from "../utils/logger.js";
dotenv.config();

const createTransporter = async () => {
  if (process.env.NODE_ENV === "development") {
    // Use Ethereal for dev testing
    const testAccount = await nodemailer.createTestAccount();
    logger.debug(`💡 Ethereal test email: ${testAccount.user}`);
    logger.debug(`🔑 Ethereal test password: ${testAccount.pass}`);
    
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for others
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
};

// Create transporter instance
const transporter = await createTransporter();
export default transporter;
