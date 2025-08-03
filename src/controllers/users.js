// src/controllers/users.js

import createHttpError from 'http-errors';
import {
  addStampToCollected,
  removeStampFromCollected,
  getCollectedStamps,
} from '../services/users.js';
import { isValidObjectId } from 'mongoose';

export const getCollectedStampsController = async (req, res, next) => {
  const userId = req.user._id;
  const collectedStamps = await getCollectedStamps(userId);
  res.json({
    status: 200,
    message: 'Successfully retrieved collected stamps!',
    data: collectedStamps,
  });
};

export const addStampToCollectedController = async (req, res, next) => {
  const userId = req.user._id;
  const { stampId } = req.params;
  if (!isValidObjectId(stampId)) {
    return next(createHttpError(400, 'Invalid stamp ID format.'));
  }
  const result = await addStampToCollected(userId, stampId);
  if (!result) {
    throw createHttpError(
      404,
      `Stamp with ID ${stampId} not found or already in collection.`,
    );
  }
  res.status(200).json({
    status: 200,
    message: 'Stamp successfully added to collection!',
    data: result,
  });
};

export const removeStampFromCollectedController = async (req, res, next) => {
  const userId = req.user._id;
  const { stampId } = req.params;
  if (!isValidObjectId(stampId)) {
    return next(createHttpError(400, 'Invalid stamp ID format.'));
  }
  const result = await removeStampFromCollected(userId, stampId);
  if (!result) {
    throw createHttpError(
      404,
      `Stamp with ID ${stampId} not found in collection.`,
    );
  }
  res.status(200).json({
    status: 200,
    message: 'Stamp successfully removed from collection!',
    data: result,
  });
};
