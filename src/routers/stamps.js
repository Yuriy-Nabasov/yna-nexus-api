import { Router } from 'express';
import {
  getStampsController,
  getStampByIdController,
} from '../controllers/stamps.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

router.get('/stamps', ctrlWrapper(getStampsController));

router.get('/stamps/:stampId', ctrlWrapper(getStampByIdController));

export default router;
