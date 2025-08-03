// src/services/users.js

import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import { StampsCollection } from '../db/models/stamp.js';

export const getCollectedStamps = async (userId) => {
  const user = await UsersCollection.findById(userId).populate(
    'collectedStamps',
  );
  if (!user) {
    throw createHttpError(404, 'User not found.');
  }
  return user.collectedStamps;
};

export const addStampToCollected = async (userId, stampId) => {
  const user = await UsersCollection.findById(userId);
  if (!user) {
    throw createHttpError(404, 'User not found.');
  }
  const stamp = await StampsCollection.findById(stampId);
  if (!stamp) {
    throw createHttpError(404, 'Stamp not found.');
  }
  const isAlreadyCollected = user.collectedStamps.some((collectedStampId) =>
    collectedStampId.equals(stampId),
  );
  if (isAlreadyCollected) {
    throw createHttpError(409, 'Stamp is already in the collection.');
  }
  user.collectedStamps.push(stampId);
  await user.save();
  const updatedUser = await UsersCollection.findById(userId).populate(
    'collectedStamps',
  );
  return updatedUser.collectedStamps;
};

export const removeStampFromCollected = async (userId, stampId) => {
  const user = await UsersCollection.findById(userId);
  if (!user) {
    throw createHttpError(404, 'User not found.');
  }
  const initialLength = user.collectedStamps.length;
  user.collectedStamps = user.collectedStamps.filter(
    (collectedStampId) => !collectedStampId.equals(stampId),
  );
  if (user.collectedStamps.length === initialLength) {
    throw createHttpError(404, 'Stamp not found in collection.');
  }
  await user.save();
  const updatedUser = await UsersCollection.findById(userId).populate(
    'collectedStamps',
  );
  return updatedUser.collectedStamps;
};
