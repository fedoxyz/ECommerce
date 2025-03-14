import Joi from 'joi';

// Assuming validateProduct is a middleware using Joi or a similar validator
// Create a separate validation schema for updates

// For complete create operations (POST)
const createProductSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.string().required(),
  categoryId: Joi.string().required(),
  stock: Joi.number().integer().required(),
  imageUrl: Joi.string().optional()
});

// For partial updates (PUT)
const updateProductSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  price: Joi.string(),
  categoryId: Joi.string(),
  stock: Joi.number().integer(),
  imageUrl: Joi.string()
}).min(1); // At least one field must be provided

export const validateProduct = (req, res, next) => {
  const schema = req.method === 'POST' ? createProductSchema : updateProductSchema;
  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  
  next();
};

