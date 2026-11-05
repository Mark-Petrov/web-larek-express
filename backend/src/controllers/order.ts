import { faker } from '@faker-js/faker';
import { NextFunction, Request, Response } from 'express';
import BadRequestError from '../errors/bad-request-error';
import Product from '../models/product';

interface IOrderBody {
  total: number;
  items: string[];
}

const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { items, total } = req.body as IOrderBody;

  try {
    const products = await Product.find({ _id: { $in: items } });
    const productsById = new Map(
      products.map((product) => [product._id.toString(), product]),
    );

    let sum = 0;
    for (let index = 0; index < items.length; index += 1) {
      const id = items[index];
      const product = productsById.get(id);
      if (!product) {
        return next(new BadRequestError(`Товар с id ${id} не найден`));
      }
      if (product.price === null || product.price === undefined) {
        return next(new BadRequestError(`Товар с id ${id} не продается`));
      }
      sum += product.price;
    }

    if (sum !== total) {
      return next(new BadRequestError('Неверная сумма заказа'));
    }

    return res.send({
      id: faker.string.uuid(),
      total,
    });
  } catch (error) {
    return next(error);
  }
};

export default createOrder;
