import Joi from 'joi';

const addToCartSchema = Joi.object({
  productId: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).required()
});

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required()
});

export const validateAddToCart = (req, res, next) => {
  const { error } = addToCartSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export const validateUpdateCartItem = (req, res, next) => {
  const { error } = updateCartItemSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
