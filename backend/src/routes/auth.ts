import { celebrate } from 'celebrate';
import { Router } from 'express';
import {
  getCurrentUser,
  login,
  logout,
  refreshAccessToken,
  register,
} from '../controllers/auth';
import auth from '../middlewares/auth';
import { loginSchema, registerSchema } from '../middlewares/validation';

const authRouter = Router();

authRouter.post('/register', celebrate({ body: registerSchema }), register);
authRouter.post('/login', celebrate({ body: loginSchema }), login);
authRouter.get('/token', refreshAccessToken);
authRouter.get('/logout', logout);
authRouter.get('/user', auth, getCurrentUser);

export default authRouter;
