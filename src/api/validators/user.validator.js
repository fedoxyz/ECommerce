import Joi from 'joi';

const updateProfileSchema = Joi.object({
  firstName: Joi.string(),
  lastName: Joi.string(),
}).min(1);

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

const changeEmailSchema = Joi.object({
  newEmail: Joi.string().email().required(),
  otps: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9]{6}-[0-9]{6}$/),
    Joi.string().valid('send')
  ).required()  
});
export const validateUpdateProfile = (req, res, next) => {
  const { error } = updateProfileSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export const validateChangePassword = (req, res, next) => {
  const { error } = changePasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export const validateChangeEmail = (req, res, next) => {
  const { error } = changeEmailSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
