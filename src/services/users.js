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

export const getCollectedStampsValue = async (userId) => {
  // Знаходимо користувача та популяризуємо його колекцію марок
  const user = await UsersCollection.findById(userId).populate(
    'collectedStamps',
  );

  if (!user) {
    throw createHttpError(404, 'User not found.');
  }

  // Обчислюємо суму цін всіх марок у колекції
  const totalValue = user.collectedStamps.reduce((sum, stamp) => {
    // Перевіряємо, чи існує stamp.price, оскільки populate може повернути null для видалених марок
    return sum + (stamp?.price || 0);
  }, 0);

  return totalValue;
};

export const getCollectedStampsPercentage = async (userId) => {
  // 1. Отримуємо кількість марок у колекції користувача
  const user = await UsersCollection.findById(userId);
  if (!user) {
    throw createHttpError(404, 'User not found.');
  }
  const userCollectedCount = user.collectedStamps.length;

  // 2. Отримуємо загальну кількість марок у базі даних
  const totalStampsCount = await StampsCollection.countDocuments();

  // 3. Розраховуємо відсоток
  let percentage = 0;
  if (totalStampsCount > 0) {
    percentage = (userCollectedCount / totalStampsCount) * 100;
  }

  // Можна округлити до 2 знаків після коми для кращого відображення
  return parseFloat(percentage.toFixed(2));
};

export const getDesiredStamps = async (userId) => {
  const user = await UsersCollection.findById(userId).populate('desiredStamps');
  if (!user) {
    throw createHttpError(404, 'User not found.');
  }
  return user.desiredStamps;
};

export const addStampToDesired = async (userId, stampId) => {
  const user = await UsersCollection.findById(userId);
  if (!user) {
    throw createHttpError(404, 'User not found.');
  }
  const stamp = await StampsCollection.findById(stampId);
  if (!stamp) {
    throw createHttpError(404, 'Stamp not found.');
  }
  // Перевіряємо, чи марка вже є у списку бажаних
  const isAlreadyDesired = user.desiredStamps.some((desiredStampId) =>
    desiredStampId.equals(stampId),
  );
  if (isAlreadyDesired) {
    throw createHttpError(409, 'Stamp is already in the desired list.');
  }
  // Перевіряємо, чи марка вже є у колекції користувача (опціонально, але логічно)
  const isAlreadyCollected = user.collectedStamps.some((collectedStampId) =>
    collectedStampId.equals(stampId),
  );
  if (isAlreadyCollected) {
    // Можливо, це не помилка, а попередження, але якщо логіка така, що бажані - це ті, яких немає
    throw createHttpError(409, 'Stamp is already in your collected stamps.');
  }

  user.desiredStamps.push(stampId);
  await user.save();
  const updatedUser = await UsersCollection.findById(userId).populate(
    'desiredStamps',
  );
  return updatedUser.desiredStamps;
};

export const removeStampFromDesired = async (userId, stampId) => {
  const user = await UsersCollection.findById(userId);
  if (!user) {
    throw createHttpError(404, 'User not found.');
  }
  const initialLength = user.desiredStamps.length;
  user.desiredStamps = user.desiredStamps.filter(
    (desiredStampId) => !desiredStampId.equals(stampId),
  );
  if (user.desiredStamps.length === initialLength) {
    throw createHttpError(404, 'Stamp not found in desired list.');
  }
  await user.save();
  const updatedUser = await UsersCollection.findById(userId).populate(
    'desiredStamps',
  );
  return updatedUser.desiredStamps;
};
