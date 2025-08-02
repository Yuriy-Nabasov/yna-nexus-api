// src/middlewares/isValidId.js

import { isValidObjectId } from 'mongoose';
import createHttpError from 'http-errors';

export const isValidId = (req, res, next) => {
  const { stampId } = req.params;
  if (!isValidObjectId(stampId)) {
    throw createHttpError(400, 'Bad Request');
  }

  next();
};
