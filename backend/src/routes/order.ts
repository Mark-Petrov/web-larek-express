import { celebrate } from 'celebrate';
import { Router } from 'express';
import createOrder from '../controllers/order';
import { orderSchema } from '../middlewares/validation';

const orderRouter = Router();

orderRouter.post('/', celebrate({ body: orderSchema }), createOrder);

export default orderRouter;
