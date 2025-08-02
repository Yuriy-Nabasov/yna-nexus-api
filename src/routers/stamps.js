// src/routers/stamps.js

import { Router } from 'express';
import {
  getStampsController,
  getStampByIdController,
  createStampController,
  deleteStampController,
  upsertStampController,
  patchStampController,
} from '../controllers/stamps.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { createStampSchema, updateStampSchema } from '../validation/stamps.js';
import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.get('/', ctrlWrapper(getStampsController));

router.get('/:stampId', isValidId, ctrlWrapper(getStampByIdController));

router.post(
  '/',
  authenticate,
  validateBody(createStampSchema),
  ctrlWrapper(createStampController),
);

router.delete(
  '/:stampId',
  authenticate,
  isValidId,
  ctrlWrapper(deleteStampController),
);

router.put(
  '/:stampId',
  authenticate,
  isValidId,
  validateBody(createStampSchema),
  ctrlWrapper(upsertStampController),
);

router.patch(
  '/:stampId',
  authenticate,
  isValidId,
  validateBody(updateStampSchema),
  ctrlWrapper(patchStampController),
);

export default router;
