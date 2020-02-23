import * as Joi from "joi";

const refreshToken = Joi.object().keys({
  refreshToken: Joi.string().required(),
});

export default {
  refreshToken,
};
