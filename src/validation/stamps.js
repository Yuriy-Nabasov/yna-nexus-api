// src/validation/stamps.js

import Joi from 'joi';

// Функція для отримання максимального року (поточний рік + запас)
const getMaxYear = () => new Date().getFullYear() + 10;

// --- Схема для створення нової марки (використовується для POST) ---
export const createStampSchema = Joi.object({
  'ukrposhta-number': Joi.string().required().trim().messages({
    'any.required': 'Поле "ukrposhta-number" є обов\'язковим.',
    'string.empty': 'Поле "ukrposhta-number" не може бути порожнім.',
    'string.base': 'Поле "ukrposhta-number" має бути рядком.',
  }),

  country: Joi.string().valid('Ukraine').default('Ukraine').messages({
    'any.required': 'Поле "country" є обов\'язковим.',
    'string.empty': 'Поле "country" не може бути порожнім.',
    'any.only': 'Поле "country" може мати лише значення "Ukraine".',
  }),

  year: Joi.number().integer().required().min(1840).max(getMaxYear()).messages({
    'any.required': 'Поле "year" є обов\'язковим.',
    'number.base': 'Поле "year" має бути числом.',
    'number.integer': 'Поле "year" має бути цілим числом.',
    'number.min': 'Поле "year" має бути не менше {{#limit}}.',
    'number.max': 'Поле "year" має бути не більше {{#limit}}.',
  }),

  picture: Joi.string().uri().required().trim().messages({
    'any.required': 'Поле "picture" є обов\'язковим.',
    'string.empty': 'Поле "picture" не може бути порожнім.',
    'string.uri': 'Поле "picture" має бути валідним URL.',
  }),

  topic: Joi.string().trim().allow('').default('').messages({
    'string.base': 'Поле "topic" має бути рядком.',
  }),

  description: Joi.string().trim().allow('').default('').messages({
    'string.base': 'Поле "description" має бути рядком.',
  }),

  denomination: Joi.string().trim().allow('').default('').messages({
    'string.base': 'Поле "denomination" має бути рядком.',
  }),

  startDate: Joi.date().iso().required().messages({
    'any.required': 'Поле "startDate" є обов\'язковим.',
    'date.base': 'Поле "startDate" має бути датою.',
    'date.iso':
      'Поле "startDate" має бути у форматі ISO 8601 (наприклад, YYYY-MM-DD).',
  }),

  circulation: Joi.number().integer().min(0).messages({
    'number.base': 'Поле "circulation" має бути числом.',
    'number.integer': 'Поле "circulation" має бути цілим числом.',
    'number.min': 'Поле "circulation" має бути не менше {{#limit}}.',
  }),

  design: Joi.string().trim().allow('').default('').messages({
    'string.base': 'Поле "design" має бути рядком.',
  }),

  blok: Joi.boolean().default(false).messages({
    'boolean.base': 'Поле "blok" має бути булевим значенням.',
  }),

  price: Joi.number().min(0).messages({
    'number.base': 'Поле "price" має бути числом.',
    'number.min': 'Поле "price" має бути не менше {{#limit}}.',
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

// --- Схема для оновлення існуючої марки (використовується для PUT/PATCH) ---
export const updateStampSchema = Joi.object({
  // Усі поля тут є необов'язковими (.optional()), оскільки при оновленні ми не завжди змінюємо все.
  // Також можна використати .forbidden() для полів, які не можна змінювати взагалі.
  'ukrposhta-number': Joi.string()
    .trim()
    .optional() // Це поле НЕ є обов'язковим при оновленні
    .messages({
      'string.empty': 'Поле "ukrposhta-number" не може бути порожнім.',
      'string.base': 'Поле "ukrposhta-number" має бути рядком.',
    }),

  country: Joi.string().valid('Ukraine').optional().messages({
    'string.empty': 'Поле "country" не може бути порожнім.',
    'any.only': 'Поле "country" може мати лише значення "Ukraine".',
  }),

  year: Joi.number().integer().min(1840).max(getMaxYear()).optional().messages({
    'number.base': 'Поле "year" має бути числом.',
    'number.integer': 'Поле "year" має бути цілим числом.',
    'number.min': 'Поле "year" має бути не менше {{#limit}}.',
    'number.max': 'Поле "year" має бути не більше {{#limit}}.',
  }),

  picture: Joi.string().uri().trim().optional().messages({
    'string.empty': 'Поле "picture" не може бути порожнім.',
    'string.uri': 'Поле "picture" має бути валідним URL.',
  }),

  topic: Joi.string().trim().allow('').optional().messages({
    'string.base': 'Поле "topic" має бути рядком.',
  }),

  description: Joi.string().trim().allow('').optional().messages({
    'string.base': 'Поле "description" має бути рядком.',
  }),

  denomination: Joi.string().trim().allow('').optional().messages({
    'string.base': 'Поле "denomination" має бути рядком.',
  }),

  startDate: Joi.date().iso().optional().messages({
    'date.base': 'Поле "startDate" має бути датою.',
    'date.iso':
      'Поле "startDate" має бути у форматі ISO 8601 (наприклад, YYYY-MM-DD).',
  }),

  circulation: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Поле "circulation" має бути числом.',
    'number.integer': 'Поле "circulation" має бути цілим числом.',
    'number.min': 'Поле "circulation" має бути не менше {{#limit}}.',
  }),

  design: Joi.string().trim().allow('').optional().messages({
    'string.base': 'Поле "design" має бути рядком.',
  }),

  blok: Joi.boolean().optional().messages({
    'boolean.base': 'Поле "blok" має бути булевим значенням.',
  }),

  price: Joi.number().min(0).optional().messages({
    'number.base': 'Поле "price" має бути числом.',
    'number.min': 'Поле "price" має бути не менше {{#limit}}.',
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});
