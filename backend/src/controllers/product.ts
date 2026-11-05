import { NextFunction, Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import Product from '../models/product';
import { moveImageToPublic } from '../utils/paths';

const getProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await Product.find({});
    return res.send({
      items: products,
      total: products.length,
    });
  } catch (error) {
    return next(error);
  }
};

const handleProductError = (
  error: unknown,
  next: NextFunction,
  validationMessage: string,
) => {
  if (error instanceof MongooseError.ValidationError) {
    return next(new BadRequestError(validationMessage));
  }
  if (error instanceof Error && error.message.includes('E11000')) {
    return next(new ConflictError('Товар с таким названием уже существует'));
  }
  return next(error);
};

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    title,
    image,
    category,
    description,
    price,
  } = req.body;

  try {
    await moveImageToPublic(image.fileName);
    const product = await Product.create({
      title,
      image,
      category,
      description,
      price,
    });
    return res.status(201).send(product);
  } catch (error) {
    return handleProductError(error, next, 'Ошибка валидации данных при создании товара');
  }
};

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { productId } = req.params;

  try {
    if (req.body.image?.fileName) {
      await moveImageToPublic(req.body.image.fileName);
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      req.body,
      { new: true, runValidators: true },
    );

    if (!product) {
      return next(new NotFoundError('Товар по указанному id не найден'));
    }

    return res.send(product);
  } catch (error) {
    return handleProductError(error, next, 'Ошибка валидации данных при обновлении товара');
  }
};

const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) {
      return next(new NotFoundError('Товар по указанному id не найден'));
    }
    return res.send(product);
  } catch (error) {
    return next(error);
  }
};

export {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
