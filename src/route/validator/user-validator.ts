import * as Joi from "joi";

const addUser = Joi.object().keys({
  email: Joi.string().email().trim().required(),
  userName: Joi.string().min(6).required(),
  password: Joi.string().trim().min(6).required(),
  avatar: Joi.string().default(''),
});

const loginUser = Joi.object().keys({
  userName: Joi.string().min(6).required(),
  password: Joi.string().trim().min(6).required(),
});

export default {
  addUser,
  loginUser,
};
