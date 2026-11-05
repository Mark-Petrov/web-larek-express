import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import BadRequestError from '../errors/bad-request-error';
import { tempDir } from '../utils/paths';

const allowedMimeTypes = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
  'image/svg+xml',
];

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    fs.mkdirSync(tempDir, { recursive: true });
    callback(null, tempDir);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomBytes(4).toString('hex')}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
      return;
    }
    callback(new BadRequestError('Недопустимый тип файла'));
  },
});

const fileMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  upload.single('file')(req, res, (error: unknown) => {
    if (!error) {
      return next();
    }
    if (error instanceof multer.MulterError) {
      return next(new BadRequestError('Ошибка загрузки файла'));
    }
    return next(error);
  });
};

export default fileMiddleware;
