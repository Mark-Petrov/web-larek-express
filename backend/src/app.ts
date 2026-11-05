import path from 'path';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

import { DB_ADDRESS, ORIGIN_ALLOW, PORT } from './config';
import NotFoundError from './errors/not-found-error';
import startTempCleanup from './middlewares/cleanup';
import errorHandler from './middlewares/error-handler';
import { errorLogger, requestLogger } from './middlewares/logger';
import Product from './models/product';
import User from './models/user';
import router from './routes';
import { ensureUploadDirs } from './utils/paths';

const app = express();

app.use(cors({
  origin: ORIGIN_ALLOW,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(requestLogger);
app.use(router);

app.use((_req, _res, next) => next(new NotFoundError('Маршрут не найден')));

app.use(errorLogger);
app.use(errorHandler);

const start = async () => {
  ensureUploadDirs();
  startTempCleanup();
  await mongoose.connect(DB_ADDRESS);
  await Promise.all([Product.init(), User.init()]);
  app.listen(PORT);
};

start().catch(() => {
  process.exit(1);
});
