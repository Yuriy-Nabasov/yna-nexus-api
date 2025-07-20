import { StampsCollection } from '../db/models/stamp.js';

export const getAllStamps = async () => {
  const stamps = await StampsCollection.find();
  return stamps;
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
