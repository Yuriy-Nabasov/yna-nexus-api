// src/services/stamps.js

import { StampsCollection } from '../db/models/stamp.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/index.js';

export const getAllStamps = async ({
  page = 1,
  perPage = 12,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  filter = {},
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const stampsQuery = StampsCollection.find();

  if (filter.year) {
    stampsQuery.where('year').equals(filter.year);
  }

  if (filter.circulation) {
    stampsQuery.where('circulation').equals(filter.circulation);
  }

  if (filter.price) {
    stampsQuery.where('price').equals(filter.price);
  }

  const [stampsCount, stamps] = await Promise.all([
    StampsCollection.find().merge(stampsQuery).countDocuments(),
    stampsQuery
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .exec(),
  ]);

  const paginationData = calculatePaginationData(stampsCount, perPage, page);

  return {
    data: stamps,
    ...paginationData,
  };
};

export const getStampById = async (stampId) => {
  const stamp = await StampsCollection.findById(stampId);
  return stamp;
};

export const createStamp = async (payload) => {
  const stamp = await StampsCollection.create(payload);
  return stamp;
};

export const deleteStamp = async (stampId) => {
  const stamp = await StampsCollection.findOneAndDelete({
    _id: stampId,
  });

  return stamp;
};

export const updateStamp = async (stampId, payload, options = {}) => {
  const rawResult = await StampsCollection.findOneAndUpdate(
    { _id: stampId },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  return {
    stamp: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject?.upserted),
  };
};

export const getTotalStampsValue = async () => {
  const result = await StampsCollection.aggregate([
    {
      $group: {
        _id: null, // Групуємо всі документи в одну групу
        totalValue: { $sum: '$price' }, // Сумуємо значення поля 'price'
      },
    },
    {
      $project: {
        _id: 0, // Виключаємо поле _id з результату
        totalValue: 1, // Включаємо поле totalValue
      },
    },
  ]);

  // Якщо марок немає, result буде порожнім масивом.
  // Повертаємо 0, якщо результат порожній, або знайдене значення.
  return result.length > 0 ? result[0].totalValue : 0;
};
