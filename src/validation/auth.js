// src/validation/auth.js

import Joi from 'joi';

// Базові правила для email та password, які будуть перевикористовуватися
const emailSchema = Joi.string()
  .email({
    minDomainSegments: 2, // Наприклад, example.com
    tlds: {
      deny: ['ru', 'by'], // Заборонений домен верхнього рівня
    },
  })
  .required()
  .messages({
    'string.email': 'Будь ласка, введіть валідний формат електронної пошти.',
    'any.required': 'Поле "email" є обов\'язковим.',
    'string.empty': 'Поле "email" не може бути порожнім.',
  });

const passwordSchema = Joi.string()
  .min(6) // Встановлюємо нову, простішу вимогу: мінімальна довжина пароля - 6 символів
  .required()
  .messages({
    // Оновлюємо повідомлення про помилку
    'string.min': 'Пароль має містити щонайменше {{#limit}} символів.',
    'any.required': 'Поле "password" є обов\'язковим.',
    'string.empty': 'Поле "password" не може бути порожнім.',
  });

// --- Схема для реєстрації нового користувача (SignUp) ---
export const registerUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required().messages({
    'string.min': "Ім'я має містити щонайменше {{#limit}} символи.",
    'string.max': "Ім'я має містити не більше {{#limit}} символів.",
    'any.required': 'Поле "name" є обов\'язковим.',
    'string.empty': 'Поле "name" не може бути порожнім.',
  }),
  email: emailSchema, // Використовуємо базову схему email
  password: passwordSchema, // Використовуємо базову схему password
}).options({
  abortEarly: false,
  stripUnknown: true, // Видаляти невідомі поля
});

// --- Схема для входу користувача (SignIn/Login) ---
export const loginUserSchema = Joi.object({
  email: emailSchema, // Використовуємо базову схему email
  password: passwordSchema, // Використовуємо базову схему password
}).options({
  abortEarly: false,
  stripUnknown: true,
});

// --- Схема для запиту на відновлення пароля (Email для скидання) ---
export const requestResetPasswordSchema = Joi.object({
  email: emailSchema,
}).options({
  abortEarly: false,
  stripUnknown: true,
});

// --- Схема для встановлення нового пароля після скидання ---
export const resetPasswordSchema = Joi.object({
  password: passwordSchema, // Новий пароль повинен відповідати правилам складності
  token: Joi.string().required().messages({
    // Токен, отриманий для скидання
    'any.required': "Токен є обов'язковим.",
    'string.empty': 'Токен не може бути порожнім.',
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

export const loginWithGoogleOAuthSchema = Joi.object({
  code: Joi.string().required(),
});
