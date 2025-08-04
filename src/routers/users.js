// src/routers/users.js

import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { authenticate } from '../middlewares/authenticate.js';
import { isValidId } from '../middlewares/isValidId.js';
import {
  addStampToCollectedController,
  removeStampFromCollectedController,
  getCollectedStampsController,
  getCollectedStampsValueController,
} from '../controllers/users.js';

const router = Router();

// Маршрут для отримання всіх марок у колекції поточного користувача
router.get(
  '/me/collected-stamps',
  authenticate,
  ctrlWrapper(getCollectedStampsController),
);

// --- МАРШРУТ Приблизна вартість колекції користувача ---
router.get(
  '/me/collected-stamps/value',
  authenticate,
  ctrlWrapper(getCollectedStampsValueController),
);

// Маршрут для додавання марки до колекції поточного користувача
router.post(
  '/me/collected-stamps/:stampId',
  authenticate,
  isValidId,
  ctrlWrapper(addStampToCollectedController),
);

// Маршрут для видалення марки з колекції поточного користувача
router.delete(
  '/me/collected-stamps/:stampId',
  authenticate,
  isValidId,
  ctrlWrapper(removeStampFromCollectedController),
);

export default router;
