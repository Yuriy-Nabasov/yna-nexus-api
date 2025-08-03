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
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { getEnvVar } from '../utils/getEnvVar.js';

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

export const createStampController = async (req, res, next) => {
  const picture = req.file;
  let pictureUrl;

  // ОБОВ'ЯЗКОВО! перевірити, чи картинка взагалі є
  if (!picture) {
    return next(
      createHttpError(400, 'Picture is required for creating a stamp.'),
    );
  }

  if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
    pictureUrl = await saveFileToCloudinary(picture);
  } else {
    pictureUrl = await saveFileToUploadDir(picture);
  }

  const stamp = await createStamp({
    ...req.body,
    picture: pictureUrl, // Передаємо URL картинки до сервісу
  });

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

  const picture = req.file;
  let pictureUrl;

  // ОБОВ'ЯЗКОВО! перевірити, чи картинка є, якщо це upsert
  if (picture) {
    // Якщо картинка є, завантажуємо її
    if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
      pictureUrl = await saveFileToCloudinary(picture);
    } else {
      pictureUrl = await saveFileToUploadDir(picture);
    }
  }

  const payload = { ...req.body };
  if (pictureUrl) {
    // Додаємо pictureUrl до payload, тільки якщо вона була завантажена
    payload.picture = pictureUrl;
  }

  // const result = await updateStamp(stampId, req.body, {
  //   upsert: true,
  // });

  const result = await updateStamp(stampId, payload, {
    // Передаємо payload
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
  const picture = req.file;
  let pictureUrl;

  if (picture) {
    if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
      pictureUrl = await saveFileToCloudinary(picture);
    } else {
      pictureUrl = await saveFileToUploadDir(picture);
    }
  }

  const payload = { ...req.body };
  if (pictureUrl) {
    // Додаємо pictureUrl до payload, тільки якщо вона була завантажена
    payload.picture = pictureUrl;
  } else if (picture === null) {
    // Якщо клієнт явно відправив "null" для видалення картинки (це залежить від того, як ви це обробляєте на фронтенді)
    payload.picture = null; // Встановлюємо картинку в null, якщо потрібно видалити
  }

  const result = await updateStamp(stampId, payload);

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
