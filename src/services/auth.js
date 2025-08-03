// src/services/auth.js

import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/index.js';
import { SessionsCollection } from '../db/models/session.js';

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');
  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  };
};

export const registerUser = async (payload) => {
  const { email, password, name } = payload;
  const userExists = await UsersCollection.findOne({ email });
  if (userExists) {
    throw createHttpError(409, 'Email is already in use');
  }
  const encryptedPassword = await bcrypt.hash(password, 10);
  const user = await UsersCollection.create({
    email,
    name,
    password: encryptedPassword,
  });
  return user;
};

export const loginUser = async (payload) => {
  const { email, password } = payload;
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }
  const isEqual = await bcrypt.compare(password, user.password);
  if (!isEqual) {
    throw createHttpError(401, 'Invalid credentials');
  }
  const newSessionData = createSession();
  await SessionsCollection.deleteMany({ userId: user._id });
  const session = await SessionsCollection.create({
    userId: user._id,
    ...newSessionData,
  });
  return session;
};

export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }
  const isRefreshTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);
  if (isRefreshTokenExpired) {
    await SessionsCollection.deleteOne({ _id: sessionId });
    throw createHttpError(401, 'Refresh token expired. Please log in again.');
  }
  const newSessionData = createSession();
  const updatedSession = await SessionsCollection.findByIdAndUpdate(
    sessionId,
    {
      accessToken: newSessionData.accessToken,
      refreshToken: newSessionData.refreshToken,
      accessTokenValidUntil: newSessionData.accessTokenValidUntil,
      refreshTokenValidUntil: newSessionData.refreshTokenValidUntil,
    },
    { new: true },
  );
  if (!updatedSession) {
    throw createHttpError(401, 'Session not found after update attempt');
  }
  return updatedSession;
};
