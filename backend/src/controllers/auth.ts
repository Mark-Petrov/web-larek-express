import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import mongoose, { Error as MongooseError } from 'mongoose';
import ms, { StringValue } from 'ms';
import {
  AUTH_ACCESS_TOKEN_EXPIRY,
  AUTH_ACCESS_TOKEN_SECRET,
  AUTH_REFRESH_TOKEN_EXPIRY,
  AUTH_REFRESH_TOKEN_SECRET,
} from '../config';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';
import User from '../models/user';
import { ITokenPayload } from '../middlewares/auth';

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: false,
  maxAge: ms(AUTH_REFRESH_TOKEN_EXPIRY as StringValue) || ms('7d'),
  path: '/',
};

const signToken = (id: string, secret: string, expiresIn: string) => jwt.sign(
  { _id: id },
  secret,
  { expiresIn: expiresIn as SignOptions['expiresIn'] },
);

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, refreshCookieOptions);
};

const clearRefreshCookie = (res: Response) => {
  res.cookie('refreshToken', '', {
    ...refreshCookieOptions,
    maxAge: 0,
  });
};

const sendAuthResponse = (
  res: Response,
  user: { email: string; name: string },
  accessToken: string,
  refreshToken: string,
) => {
  setRefreshCookie(res, refreshToken);
  return res.send({
    user: {
      email: user.email,
      name: user.name,
    },
    success: true,
    accessToken,
  });
};

const issueTokens = async (userId: string) => {
  const accessToken = signToken(userId, AUTH_ACCESS_TOKEN_SECRET, AUTH_ACCESS_TOKEN_EXPIRY);
  const refreshToken = signToken(userId, AUTH_REFRESH_TOKEN_SECRET, AUTH_REFRESH_TOKEN_EXPIRY);
  await User.updateOne({ _id: userId }, { $push: { tokens: { token: refreshToken } } });
  return { accessToken, refreshToken };
};

const readRefreshPayload = (token: string) => {
  try {
    return jwt.verify(token, AUTH_REFRESH_TOKEN_SECRET) as ITokenPayload;
  } catch (_error) {
    return null;
  }
};

const register = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.create({ name, email, password });
    const { accessToken, refreshToken } = await issueTokens(user._id.toString());
    return sendAuthResponse(res, user, accessToken, refreshToken);
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError('Переданы некорректные данные при регистрации'));
    }
    if (error instanceof Error && error.message.includes('E11000')) {
      return next(new ConflictError('Пользователь с таким email уже существует'));
    }
    return next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new UnauthorizedError('Неправильные почта или пароль'));
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return next(new UnauthorizedError('Неправильные почта или пароль'));
    }

    const { accessToken, refreshToken } = await issueTokens(user._id.toString());
    return sendAuthResponse(res, user, accessToken, refreshToken);
  } catch (error) {
    return next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies as { refreshToken?: string };

  if (!refreshToken) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  const payload = readRefreshPayload(refreshToken);
  if (!payload) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  if (!mongoose.isValidObjectId(payload._id)) {
    return next(new BadRequestError('Некорректный id пользователя'));
  }

  try {
    const user = await User.findById(payload._id).select('+tokens');
    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }

    await User.updateOne(
      { _id: user._id },
      { $pull: { tokens: { token: refreshToken } } },
    );
    clearRefreshCookie(res);
    return res.send({ success: true });
  } catch (error) {
    return next(error);
  }
};

const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies as { refreshToken?: string };

  if (!refreshToken) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  const payload = readRefreshPayload(refreshToken);
  if (!payload) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  if (!mongoose.isValidObjectId(payload._id)) {
    return next(new BadRequestError('Некорректный id пользователя'));
  }

  try {
    const user = await User.findById(payload._id).select('+tokens');
    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }

    const tokenIsStored = user.tokens.some((item) => item.token === refreshToken);
    if (!tokenIsStored) {
      return next(new UnauthorizedError('Необходима авторизация'));
    }

    await User.updateOne(
      { _id: user._id },
      { $pull: { tokens: { token: refreshToken } } },
    );
    const tokens = await issueTokens(user._id.toString());
    return sendAuthResponse(res, user, tokens.accessToken, tokens.refreshToken);
  } catch (error) {
    return next(error);
  }
};

const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  const { user: tokenUser } = req as Request & { user: ITokenPayload };

  if (!mongoose.isValidObjectId(tokenUser._id)) {
    return next(new BadRequestError('Некорректный id пользователя'));
  }

  try {
    const user = await User.findById(tokenUser._id);
    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }

    return res.send({
      user: {
        email: user.email,
        name: user.name,
      },
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};

export {
  getCurrentUser,
  login,
  logout,
  refreshAccessToken,
  register,
};
