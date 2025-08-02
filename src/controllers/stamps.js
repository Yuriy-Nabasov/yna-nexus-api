// src/controllers/stamps.js

import {
  getAllStamps,
  getStampById,
  createStamp,
  deleteStamp,
  updateStamp,
} from '../services/stamps.js';
import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';

export const getStampsController = async (req, res, next) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);

  const stamps = await getAllStamps({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
  });

  res.json({
    status: 200,
    message: 'Successfully found stamps!',
    data: stamps,
  });
};

export const getStampByIdController = async (req, res, next) => {
  const { stampId } = req.params;
  const stamp = await getStampById(stampId);

  if (!stamp) {
    throw createHttpError(404, 'Stamp not found');
  }

  // Відповідь, якщо контакт знайдено
  res.json({
    status: 200,
    message: `Successfully found stamp with id ${stampId}!`,
    data: stamp,
  });
};

export const createStampController = async (req, res) => {
  const stamp = await createStamp(req.body);

  res.status(201).json({
    status: 201,
    message: `Successfully created a stamp!`,
    data: stamp,
  });
};

export const deleteStampController = async (req, res, next) => {
  const { stampId } = req.params;
  const stamp = await deleteStamp(stampId);

  if (!stamp) {
    next(createHttpError(404, 'Stamp not found'));
    return;
  }

  res.status(204).send();
};

export const upsertStampController = async (req, res, next) => {
  const { stampId } = req.params;

  const result = await updateStamp(stampId, req.body, {
    upsert: true,
  });

  if (!result) {
    next(createHttpError(404, 'Stamp not found'));
    return;
  }

  const status = result.isNew ? 201 : 200;

  res.status(status).json({
    status,
    message: `Successfully upserted a stamp!`,
    data: result.stamp,
  });
};

export const patchStampController = async (req, res, next) => {
  const { stampId } = req.params;
  const result = await updateStamp(stampId, req.body);

  if (!result) {
    next(createHttpError(404, 'Stamp not found'));
    return;
  }

  res.json({
    status: 200,
    message: `Successfully patched a stamp!`,
    data: result.stamp,
  });
};
