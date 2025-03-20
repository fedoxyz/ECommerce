import transporter from "../../configs/nodemailer.js";
import ejs from 'ejs';
import path from 'path';
import fs from 'fs';
import logger from '../../utils/logger.js';
import { fileURLToPath } from "url";
import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html, from }) => {
  logger.debug(`Sending email to ${to}`)
  logger.debug(`Sending from ${from}`)
  const info = await transporter.sendMail({
    from: `"Company Name" <${from}>`, // Sender email
    to,
    subject,
    html,
  });

  logger.info(`📧 Email sent: ${info.messageId}`);
  if (process.env.NODE_ENV === "development") {
    logger.debug(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  }
};

const renderEmailTemplate = (template, data) => {
  try {
    const templateData = template.split(".");
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // Load the EJS template from the templates folder
    const templatePath = path.resolve(__dirname, `./templates/${templateData[0]}/${templateData[1]}.ejs`);
    
    // Read the template file
    const templateSource = fs.readFileSync(templatePath, 'utf8');

    // Render the template with dynamic data
    return ejs.render(templateSource, data);
  } catch (error) {
    logger.error('Error rendering email template:', error.message);
    throw error;
  }
};

export { renderEmailTemplate, sendEmail };

