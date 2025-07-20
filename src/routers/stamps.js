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

const router = Router();

router.get('/stamps', ctrlWrapper(getStampsController));

router.get('/stamps/:stampId', ctrlWrapper(getStampByIdController));

router.post('/stamps', ctrlWrapper(createStampController));

router.delete('/stamps/:stampId', ctrlWrapper(deleteStampController));

router.put('/stamps/:stampId', ctrlWrapper(upsertStampController));

router.patch('/stamps/:stampId', ctrlWrapper(patchStampController));

export default router;
