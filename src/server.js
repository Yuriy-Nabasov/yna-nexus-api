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

const APP_DOMAIN = getEnvVar('APP_DOMAIN');

export const startServer = () => {
  const app = express();

  const allowedOrigins = [
    'http://localhost:4484',
    'https://yna-nexus-api.onrender.com',
    'https://yna-nexus-frontend.vercel.app',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(cookieParser());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  // Створюємо проміжний обробник для динамічного завантаження файлу специфікації.
  const dynamicSwaggerLoader = (req, res, next) => {
    const acceptLanguage = req.headers['accept-language'];

    let lang = 'en';
    if (acceptLanguage && acceptLanguage.includes('uk')) {
      lang = 'ua';
    }

    const swaggerFilePath = path.resolve(`./swagger.${lang}.yaml`);
    let swaggerDocument;
    try {
      swaggerDocument = YAML.load(swaggerFilePath);
    } catch (error) {
      console.error(`Failed to load Swagger file: ${swaggerFilePath}`, error);
      swaggerDocument = YAML.load(path.resolve('./swagger.en.yaml'));
    }

    const swaggerServerUrl =
      APP_DOMAIN || `${req.protocol}://${req.get('host')}`;
    swaggerDocument.servers = [{ url: swaggerServerUrl }];

    req.swaggerDoc = swaggerDocument;

    next();
  };

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
