import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AUTH_ACCESS_TOKEN_SECRET } from '../config';
import UnauthorizedError from '../errors/unauthorized-error';

export interface ITokenPayload {
  _id: string;
}

export interface IAuthedRequest extends Request {
  user: ITokenPayload;
}

const auth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.header('authorization');

  if (!header || !header.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  const token = header.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, AUTH_ACCESS_TOKEN_SECRET) as ITokenPayload;
    (req as IAuthedRequest).user = payload;
    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Истек срок действия токена'));
    }
    return next(new UnauthorizedError('Необходима авторизация'));
  }
};

export default auth;
