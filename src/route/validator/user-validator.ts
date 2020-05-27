import * as Joi from "joi";

const addUser = Joi.object().keys({
  email: Joi.string().email().trim().required().error(new Error('Invalid email')),
  userName: Joi.string().min(6).required().error(new Error('Invalid userName')),
  password: Joi.string().trim().min(6).required().error(new Error('Invalid password')),
  avatar: Joi.string().default('').error(new Error('Invalid avatar')),
});

const loginUser = Joi.object().keys({
  userName: Joi.string().min(6).required(),
  password: Joi.string().trim().min(6).required(),
});

export default {
  addUser,
  loginUser,
};
