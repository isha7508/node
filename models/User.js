// models/User.js
const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Joi Validation Function with Custom Messages
function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.base': 'Name should be a type of text',
        'string.empty': 'Name cannot be an empty field',
        'string.min': 'Name should have a minimum length of {#limit}',
        'string.max': 'Name should have a maximum length of {#limit}',
        'any.required': 'Name is a required field',
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.base': 'Email should be a type of text',
        'string.empty': 'Email cannot be an empty field',
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is a required field',
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.base': 'Password should be a type of text',
        'string.empty': 'Password cannot be an empty field',
        'string.min': 'Password should have a minimum length of {#limit}',
        'any.required': 'Password is a required field',
      }),
  });
  return schema.validate(user);
}

module.exports = mongoose.model('User', userSchema);
module.exports.validateUser = validateUser;
