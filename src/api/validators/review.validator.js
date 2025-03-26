import Joi from 'joi';

// Schema for creating reviews
const createReviewSchema = Joi.object({
  productId: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base': 'Product ID must be a string',
      'string.empty': 'Product ID cannot be empty',
      'any.required': 'Product ID is required'
    }),
  
  rating: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .required()
    .messages({
      'number.base': 'Rating must be a number',
      'number.integer': 'Rating must be a whole number',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot be more than 10',
      'any.required': 'Rating is required'
    }),
  
  comment: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.base': 'Comment must be a string',
      'string.empty': 'Comment cannot be empty',
      'string.min': 'Comment must be at least 1 character long',
      'string.max': 'Comment cannot exceed 1000 characters',
      'any.required': 'Comment is required'
    })
}).options({ abortEarly: false });

// Schema for updating reviews (more lenient)
const updateReviewSchema = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .optional()
    .messages({
      'number.base': 'Rating must be a number',
      'number.integer': 'Rating must be a whole number',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot be more than 10'
    }),
  
  comment: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .optional()
    .messages({
      'string.base': 'Comment must be a string',
      'string.empty': 'Comment cannot be empty',
      'string.min': 'Comment must be at least 1 character long',
      'string.max': 'Comment cannot exceed 1000 characters'
    })
}).options({ abortEarly: false });

// Middleware for validating review creation
export const validateReviewCreate = (req, res, next) => {
  const { error } = createReviewSchema.validate(req.body);
  
  if (error) {
    const errors = error.details.map(err => ({
      field: err.path[0],
      message: err.message
    }));
    
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors 
    });
  }
  
  next();
};

// Middleware for validating review updates
export const validateReviewUpdate = (req, res, next) => {
  const { error } = updateReviewSchema.validate(req.body);
  
  if (error) {
    const errors = error.details.map(err => ({
      field: err.path[0],
      message: err.message
    }));
    
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors 
    });
  }
  
  next();
};

// Middleware to validate review ID parameter
export const validateReviewId = (req, res, next) => {
  const idSchema = Joi.string()
    .trim()
    .required()
    .messages({
      'any.required': 'Review ID is required',
      'string.empty': 'Review ID cannot be empty'
    });
  
  const { error } = idSchema.validate(req.params.id);
  
  if (error) {
    return res.status(400).json({ 
      message: 'Invalid review ID',
      error: error.details[0].message 
    });
  }
  
  next();
};

// Middleware to validate product ID parameter
export const validateProductId = (req, res, next) => {
  const productIdSchema = Joi.string()
    .trim()
    .required()
    .messages({
      'any.required': 'Product ID is required',
      'string.empty': 'Product ID cannot be empty'
    });
  
  const { error } = productIdSchema.validate(req.params.productId);
  
  if (error) {
    return res.status(400).json({ 
      message: 'Invalid product ID',
      error: error.details[0].message 
    });
  }
  
  next();
};
