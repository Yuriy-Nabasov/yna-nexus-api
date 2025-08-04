// src/server.js

import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import { getEnvVar } from './utils/getEnvVar.js';
import router from './routers/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';
import { UPLOAD_DIR } from './constants/index.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const PORT = Number(getEnvVar('PORT', '4484'));

export const startServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  // Створюємо проміжний обробник (middleware) для динамічного завантаження файлу специфікації.
  // Цей обробник буде виконуватися перед swagger-ui, щоб визначити, який файл завантажити.
  const dynamicSwaggerLoader = (req, res, next) => {
    // Зчитуємо заголовок Accept-Language, який надсилає браузер.
    const acceptLanguage = req.headers['accept-language'];

    // Визначаємо мову. За замовчуванням встановлюємо 'en'.
    let lang = 'en';
    if (acceptLanguage && acceptLanguage.includes('uk')) {
      lang = 'ua';
    }

    // Завантажуємо відповідний файл специфікації.
    // const swaggerDocument = YAML.load('./swagger.yaml');
    const swaggerFilePath = path.resolve(`./swagger.${lang}.yaml`);
    let swaggerDocument;
    try {
      swaggerDocument = YAML.load(swaggerFilePath);
    } catch (error) {
      console.error(`Failed to load Swagger file: ${swaggerFilePath}`, error);
      // Якщо файл не знайдено, завантажуємо англійську версію як запасний варіант.
      swaggerDocument = YAML.load(path.resolve('./swagger.en.yaml'));
    }
    // Оновлюємо URL сервера в специфікації.
    // Це дозволяє Swagger UI надсилати запити на правильний домен (локальний чи на Render).
    // req.protocol повертає 'http' або 'https'.
    // req.get('host') повертає 'localhost:4484' або 'yna-nexus-api.onrender.com'.
    const newServerUrl = `${req.protocol}://${req.get('host')}`;
    swaggerDocument.servers = [{ url: newServerUrl }];

    // Передаємо оновлений документ наступному обробнику.
    req.swaggerDoc = swaggerDocument;

    next();
  };

  // Використовуємо наш динамічний завантажувач перед swagger-ui.
  // Замість статичного документу, ми передаємо функцію, яка повертає документ з об'єкта req.
  // Це дозволяє swagger-ui налаштовуватись індивідуально для кожного запиту.
  app.use(
    '/api-docs',
    dynamicSwaggerLoader,
    swaggerUi.serve,
    swaggerUi.setup((req) => req.swaggerDoc),
  );

  app.get('/', (req, res) => {
    res.json({ message: 'Hello YNA! Your Nexus Archive API is running.' });
  });

  app.use(router);

  app.use('/uploads', express.static(UPLOAD_DIR));

  app.use(notFoundHandler);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
