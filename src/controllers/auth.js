// src/controllers/auth.js

import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUsersSession,
  resetPassword,
  requestResetPassword,
} from '../services/auth.js';
import { ONE_DAY } from '../constants/index.js';
import createHttpError from 'http-errors';
import { generateAuthUrl } from '../utils/googleOAuth2.js';
import { loginOrSignupWithGoogle } from '../services/auth.js';

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
    secure: process.env.NODE_ENV === 'production', // Використовувати тільки через HTTPS у продакшені
    sameSite: 'Lax', // Захист від CSRF
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
  });
};

export const registerUserController = async (req, res) => {
  const { user, accessToken, refreshToken } = await registerUser(req.body);

  setupSession(res, { refreshToken, _id: user._id });

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user and logged in!',
    data: {
      user,
      accessToken,
    },
  });
};

export const loginUserController = async (req, res) => {
  const { user, accessToken, refreshToken } = await loginUser(req.body);

  setupSession(res, { refreshToken, _id: user._id });

  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      user,
      accessToken,
    },
  });
};

export const logoutUserController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

export const refreshUserSessionController = async (req, res, next) => {
  if (!req.cookies.sessionId || !req.cookies.refreshToken) {
    return next(createHttpError(401, 'Session cookies not found'));
  }

  const { user, accessToken, refreshToken } = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  setupSession(res, { refreshToken, _id: user._id });

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      user,
      accessToken,
    },
  });
};

export const requestResetPasswordController = async (req, res) => {
  await requestResetPassword(req.body.email);
  res.json({
    message: 'Reset password email was successfully sent!',
    status: 200,
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);
  res.json({
    message: 'Password was successfully reset!',
    status: 200,
    data: {},
  });
};

export const getGoogleOAuthUrlController = async (req, res) => {
  const url = generateAuthUrl();
  res.json({
    status: 200,
    message: 'Successfully got Google OAuth url!',
    data: {
      url,
    },
  });
};

export const loginWithGoogleController = async (req, res) => {
  const session = await loginOrSignupWithGoogle(req.body.code);
  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully logged in via Google OAuth!',
    data: {
      accessToken: session.accessToken,
    },
  });
};
