import { Joi } from 'celebrate';
import validator from 'validator';

const productSchema = Joi.object({
  title: Joi.string().min(2).max(30).required(),
  image: Joi.object({
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  }).required(),
  category: Joi.string().required(),
  description: Joi.string(),
  price: Joi.number().allow(null),
});

const orderSchema = Joi.object({
  payment: Joi.string().valid('card', 'online').required(),
  email: Joi.string().required().custom((value, helpers) => {
    if (validator.isEmail(value)) {
      return value;
    }
    return helpers.error('string.email');
  }),
  phone: Joi.string().required(),
  address: Joi.string().required(),
  total: Joi.number().required(),
  items: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
});

const productUpdateSchema = Joi.object({
  title: Joi.string().min(2).max(30),
  image: Joi.object({
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  }),
  category: Joi.string(),
  description: Joi.string().allow(''),
  price: Joi.number().allow(null),
});

const productIdSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
});

const emailSchema = Joi.string().required().custom((value, helpers) => {
  if (validator.isEmail(value)) {
    return value;
  }
  return helpers.error('string.email');
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(30),
  email: emailSchema,
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

export {
  productSchema,
  productUpdateSchema,
  productIdSchema,
  orderSchema,
  registerSchema,
  loginSchema,
};
