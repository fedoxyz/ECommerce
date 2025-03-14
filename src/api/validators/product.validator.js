import Joi from 'joi';

const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).required(),
  categoryId: Joi.string().uuid(),
  imageUrl: Joi.string().uri()
});

export const validateProduct = (req, res, next) => {
  const { error } = productSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
