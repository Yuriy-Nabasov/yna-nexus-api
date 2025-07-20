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

const router = Router();

router.get('/stamps', ctrlWrapper(getStampsController));

router.get('/stamps/:stampId', isValidId, ctrlWrapper(getStampByIdController));

// router.post('/stamps', ctrlWrapper(createStampController));

router.post(
  '/stamps',
  validateBody(createStampSchema),
  ctrlWrapper(createStampController),
);

router.delete(
  '/stamps/:stampId',
  isValidId,
  ctrlWrapper(deleteStampController),
);

router.put(
  '/stamps/:stampId',
  isValidId,
  validateBody(createStampSchema),
  ctrlWrapper(upsertStampController),
);

router.patch(
  '/stamps/:stampId',
  isValidId,
  validateBody(updateStampSchema),
  ctrlWrapper(patchStampController),
);

export default router;
