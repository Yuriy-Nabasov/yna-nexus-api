// src/services/auth.js

import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import { FIFTEEN_MINUTES, ONE_DAY, TEMPLATES_DIR } from '../constants/index.js';
import { SessionsCollection } from '../db/models/session.js';
import jwt from 'jsonwebtoken';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendEmail } from '../utils/sendMail.js';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import {
  getFullNameFromGoogleTokenPayload,
  validateCode,
} from '../utils/googleOAuth2.js';

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
  const userExists = await UsersCollection.findOne({ email: payload.email });
  if (userExists) {
    throw createHttpError(409, 'Email in use');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);
  const newUser = await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });

  // Автоматичний логін після реєстрації
  const newSessionData = createSession();
  const session = await SessionsCollection.create({
    userId: newUser._id,
    ...newSessionData,
  });

  return {
    user: newUser,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    sessionId: session._id,
  };
};

// export const registerUser = async (payload) => {
//   const user = await UsersCollection.findOne({ email: payload.email });
//   if (user) throw createHttpError(409, 'Email in use');

//   const encryptedPassword = await bcrypt.hash(payload.password, 10);

//   return await UsersCollection.create({
//     ...payload,
//     password: encryptedPassword,
//   });
// };

export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  const isEqual = await bcrypt.compare(payload.password, user.password);

  if (!isEqual) {
    throw createHttpError(401, 'Unauthorized');
  }

  await SessionsCollection.deleteOne({ userId: user._id });

  const newSessionData = createSession();
  const session = await SessionsCollection.create({
    userId: user._id,
    ...newSessionData,
  });

  return {
    user, // Додано інформацію про користувача
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    sessionId: session._id,
  };
};

// export const loginUser = async (payload) => {
//   const user = await UsersCollection.findOne({ email: payload.email });
//   if (!user) {
//     throw createHttpError(404, 'User not found');
//   }
//   const isEqual = await bcrypt.compare(payload.password, user.password);

//   if (!isEqual) {
//     throw createHttpError(401, 'Unauthorized');
//   }

//   await SessionsCollection.deleteOne({ userId: user._id });

//   const accessToken = randomBytes(30).toString('base64');
//   const refreshToken = randomBytes(30).toString('base64');

//   return await SessionsCollection.create({
//     userId: user._id,
//     accessToken,
//     refreshToken,
//     accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
//     refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
//   });
// };

export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  let cleanSessionId = sessionId;

  // Очищаємо sessionId, якщо він має формат "j:"...
  if (sessionId.startsWith('j%3A%22')) {
    const decodedSessionId = decodeURIComponent(sessionId);
    if (decodedSessionId.startsWith('j:"') && decodedSessionId.endsWith('"')) {
      cleanSessionId = decodedSessionId.substring(
        3,
        decodedSessionId.length - 1,
      );
    }
  }

  const session = await SessionsCollection.findOne({
    _id: cleanSessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isRefreshTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isRefreshTokenExpired) {
    await SessionsCollection.deleteOne({ _id: cleanSessionId });
    throw createHttpError(401, 'Refresh token expired. Please log in again.');
  }

  const user = await UsersCollection.findById(session.userId);
  if (!user) {
    throw createHttpError(404, 'User not found for this session');
  }

  const newSessionData = createSession();
  const updatedSession = await SessionsCollection.findByIdAndUpdate(
    cleanSessionId,
    {
      accessToken: newSessionData.accessToken,
      refreshToken: newSessionData.refreshToken,
      accessTokenValidUntil: newSessionData.accessTokenValidUntil,
      refreshTokenValidUntil: newSessionData.refreshTokenValidUntil,
    },
    { new: true },
  );

  return {
    user, // Додано інформацію про користувача
    accessToken: updatedSession.accessToken,
    refreshToken: updatedSession.refreshToken,
    sessionId: updatedSession._id,
  };
};

// export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
//   const session = await SessionsCollection.findOne({
//     _id: sessionId,
//     refreshToken,
//   });

//   if (!session) {
//     throw createHttpError(401, 'Session not found');
//   }

//   const isSessionTokenExpired =
//     new Date() > new Date(session.refreshTokenValidUntil);

//   if (isSessionTokenExpired) {
//     throw createHttpError(401, 'Session token expired');
//   }

//   const newSession = createSession();

//   await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

//   return await SessionsCollection.create({
//     userId: session.userId,
//     ...newSession,
//   });
// };

export const requestResetPassword = async (email) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    // throw createHttpError(404, 'User not found');
    // Важливо: для безпеки не повідомляємо, чи існує email
    // Просто повертаємо, не кидаємо помилку 404
    return;
  }

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email: user.email,
    },
    getEnvVar('JWT_SECRET'),
    {
      expiresIn: '15m',
    },
  );

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html',
  );

  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();

  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    link: `${getEnvVar('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  try {
    await sendEmail({
      from: getEnvVar('SMTP_FROM'),
      to: email,
      subject: 'Reset your password for PostMarkHub',
      html,
    });
  } catch (error) {
    console.error('Error sending reset password email:', error);
    // Тут не кидаємо помилку, щоб не блокувати користувача, якщо пошта не відправилась
    // але бажано її логувати або сповіщати адмінів
  }
};

export const resetPassword = async (payload) => {
  let entries;

  try {
    entries = jwt.verify(payload.token, getEnvVar('JWT_SECRET'));
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'TokenExpiredError') {
        throw createHttpError(401, 'Password reset token expired.');
      }
      if (err.name === 'JsonWebTokenError') {
        throw createHttpError(401, 'Invalid password reset token.');
      }
      throw createHttpError(401, err.message);
    }
    throw err;
  }

  const user = await UsersCollection.findOne({
    email: entries.email,
    _id: entries.sub,
  });

  if (!user) {
    throw createHttpError(404, 'User not found or token invalid.'); // Загальніше повідомлення
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);
  // Використовуємо findByIdAndUpdate для оновлення пароля та очищення полів токена
  await UsersCollection.findByIdAndUpdate(
    user._id,
    {
      password: encryptedPassword,
      resetToken: null,
      resetTokenValidUntil: null,
    },
    { new: true }, // Опціонально, якщо потрібно повернути оновлений об'єкт
  );
};

export const loginOrSignupWithGoogle = async (code) => {
  const loginTicket = await validateCode(code);
  const payload = loginTicket.getPayload();
  if (!payload) throw createHttpError(401, 'Google OAuth payload missing.');

  // Перевірка, чи Google надає email
  if (!payload.email) {
    throw createHttpError(
      400,
      'Google account does not provide an email address.',
    );
  }

  let user = await UsersCollection.findOne({ email: payload.email });
  if (!user) {
    const password = await bcrypt.hash(randomBytes(10), 10);
    user = await UsersCollection.create({
      email: payload.email,
      name: getFullNameFromGoogleTokenPayload(payload),
      password,
      role: 'user',
    });
  }

  // Видаляємо всі попередні сесії для цього користувача, щоб забезпечити чисту сесію
  await SessionsCollection.deleteMany({ userId: user._id });
  const newSession = createSession();

  return await SessionsCollection.create({
    userId: user._id,
    ...newSession,
  });
};
