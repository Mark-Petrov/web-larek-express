import { isCelebrateError } from 'celebrate';
import { NextFunction, Request, Response } from 'express';

interface IStatusError extends Error {
  statusCode: number;
}

const isStatusError = (error: Error): error is IStatusError => (
  'statusCode' in error && typeof (error as IStatusError).statusCode === 'number'
);

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (isCelebrateError(err)) {
    const detail = err.details.values().next().value;
    return res.status(400).send({ message: detail?.message || err.message });
  }

  const statusCode = isStatusError(err) ? err.statusCode : 500;
  const message = statusCode === 500
    ? 'На сервере произошла ошибка'
    : err.message;

  return res.status(statusCode).send({ message });
};

export default errorHandler;
