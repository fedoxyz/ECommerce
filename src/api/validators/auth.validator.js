import Joi from 'joi';

const registerSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  otp: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9]{6}$/),
    Joi.string().valid('none')
  ).required()
});

const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  otpCode: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9]{6}$/),
    Joi.string().valid('send')
  ).required()
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  otp: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9]{6}$/),
    Joi.string().valid('send')
  ).required()
});

export const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export const validateVerifyEmail = (req, res, next) => {
  const { error } = verifyEmailSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export const validateResetPassword = (req, res, next) => {
  const { error } = resetPasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};


