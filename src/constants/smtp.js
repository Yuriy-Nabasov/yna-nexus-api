// src/constants/smtp.js

import { getEnvVar } from '../utils/getEnvVar.js';

export const SMTP_CONFIG = {
  HOST: getEnvVar('SMTP_HOST'),
  PORT: Number(getEnvVar('SMTP_PORT')),
  USER: getEnvVar('SMTP_USER'),
  PASSWORD: getEnvVar('SMTP_PASSWORD'),
  FROM: getEnvVar('SMTP_FROM'),
};
