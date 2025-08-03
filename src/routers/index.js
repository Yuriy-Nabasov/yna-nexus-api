// src/routers/index.js

import { Router } from 'express';
import stampsRouter from './stamps.js';
import authRouter from './auth.js';
import usersRouter from './users.js';

const router = Router();

router.use('/stamps', stampsRouter);
router.use('/auth', authRouter);
router.use('/users', usersRouter);

export default router;
