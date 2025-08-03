// src/constants/index.js

import path from 'node:path';

export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
};

export const FIFTEEN_MINUTES = 15 * 60 * 1000;
export const ONE_DAY = 24 * 60 * 60 * 1000;
export const ONE_HOUR = 60 * 60 * 1000;

export const ROLES = {
  ADMIN: 'adminDb',
  USER: 'user',
};

export const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates');
