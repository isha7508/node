const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Joi Validation Functions
const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required().messages({
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name should have at least {#limit} characters',
      'any.required': 'Name is required',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password should have at least {#limit} characters',
      'any.required': 'Password is required',
    }),
  });
  return schema.validate(user);
};

const validateLogin = (user) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password should have at least {#limit} characters',
      'any.required': 'Password is required',
    }),
  });
  return schema.validate(user);
};

module.exports = {
  User: mongoose.model('User', userSchema),
  validateUser,
  validateLogin,
};
