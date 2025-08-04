// src/routers/stamps.js

import { Router } from 'express';
import {
  getStampsController,
  getStampByIdController,
  createStampController,
  deleteStampController,
  upsertStampController,
  patchStampController,
  getTotalStampsValueController,
} from '../controllers/stamps.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { createStampSchema, updateStampSchema } from '../validation/stamps.js';
import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';

import { checkRoles } from '../middlewares/checkRoles.js';
import { ROLES } from '../constants/index.js';
import { upload } from '../middlewares/multer.js';

const router = Router();

router.get('/total-value', ctrlWrapper(getTotalStampsValueController));

router.get('/', ctrlWrapper(getStampsController));

router.get('/:stampId', isValidId, ctrlWrapper(getStampByIdController));

router.post(
  '/',
  authenticate,
  checkRoles(ROLES.ADMIN),
  upload.single('picture'),
  validateBody(createStampSchema),
  ctrlWrapper(createStampController),
);

router.delete(
  '/:stampId',
  authenticate,
  checkRoles(ROLES.ADMIN),
  isValidId,
  ctrlWrapper(deleteStampController),
);

router.put(
  '/:stampId',
  authenticate,
  checkRoles(ROLES.ADMIN),
  upload.single('picture'),
  isValidId,
  validateBody(createStampSchema),
  ctrlWrapper(upsertStampController),
);

router.patch(
  '/:stampId',
  authenticate,
  checkRoles(ROLES.ADMIN),
  upload.single('picture'),
  isValidId,
  validateBody(updateStampSchema),
  ctrlWrapper(patchStampController),
);

export default router;
