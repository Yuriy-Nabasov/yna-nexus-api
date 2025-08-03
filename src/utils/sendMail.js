import nodemailer from 'nodemailer';
import { SMTP_CONFIG } from '../constants/smtp.js';

const transporter = nodemailer.createTransport({
  host: SMTP_CONFIG.HOST,
  port: SMTP_CONFIG.PORT,
  secure: SMTP_CONFIG.PORT === 465,
  auth: {
    user: SMTP_CONFIG.USER,
    pass: SMTP_CONFIG.PASSWORD,
  },
});

export const sendEmail = async (options) => {
  return await transporter.sendMail(options);
};
