import { StampsCollection } from '../db/models/stamp.js';

export const getAllStamps = async () => {
  const stamps = await StampsCollection.find();
  return stamps;
};

export const getStampById = async (stampId) => {
  const stamp = await StampsCollection.findById(stampId);
  return stamp;
};
