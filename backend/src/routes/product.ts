import { celebrate } from 'celebrate';
import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../controllers/product';
import auth from '../middlewares/auth';
import {
  productIdSchema,
  productSchema,
  productUpdateSchema,
} from '../middlewares/validation';

const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.post('/', auth, celebrate({ body: productSchema }), createProduct);
productRouter.patch(
  '/:productId',
  auth,
  celebrate({ params: productIdSchema, body: productUpdateSchema }),
  updateProduct,
);
productRouter.delete(
  '/:productId',
  auth,
  celebrate({ params: productIdSchema }),
  deleteProduct,
);

export default productRouter;
