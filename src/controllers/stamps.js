import { getAllStamps, getStampById } from '../services/stamps.js';

export const getStampsController = async (req, res, next) => {
  const stamps = await getAllStamps();
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
    next(new Error('Stamp not found'));
    return;
  }

  // Відповідь, якщо контакт знайдено
  res.json({
    status: 200,
    message: `Successfully found stamp with id ${stampId}!`,
    data: stamp,
  });
};
