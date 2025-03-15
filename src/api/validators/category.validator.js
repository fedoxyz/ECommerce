import Joi from 'joi';

const categorySchema = Joi.object({
  name: Joi.string().min(3).max(255).optional(),
  description: Joi.string().max(500).optional(),
  isActive: Joi.boolean().optional()
}).min(1);

export const validateCategory = (req, res, next) => {
  const { error } = categorySchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

