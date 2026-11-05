import { Router } from 'express';
import authRouter from './auth';
import orderRouter from './order';
import productRouter from './product';
import uploadRouter from './upload';

const router = Router();

router.use('/product', productRouter);
router.use('/order', orderRouter);
router.use('/auth', authRouter);
router.use('/upload', uploadRouter);

export default router;
