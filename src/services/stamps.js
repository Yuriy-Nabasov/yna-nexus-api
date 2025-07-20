import { StampsCollection } from '../db/models/stamp.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/index.js';

export const getAllStamps = async ({
  page = 1,
  perPage = 12,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  // const stamps = await StampsCollection.find();
  // return stamps;

  const stampsQuery = StampsCollection.find();
  const stampsCount = await StampsCollection.find()
    .merge(stampsQuery)
    .countDocuments();

  const stamps = await stampsQuery
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder })
    .exec();

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
