// src/routers/index.js

import { Router } from 'express';
import stampsRouter from './stamps.js';
import authRouter from './auth.js';

const router = Router();

router.use('/stamps', stampsRouter);
router.use('/auth', authRouter);

export default router;
