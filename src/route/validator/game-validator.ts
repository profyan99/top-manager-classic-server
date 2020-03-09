import * as Joi from "joi";

const addScenario = Joi.object().keys({
  name: Joi.string().min(6).required(),
  description: Joi.string().min(6).required(),
  loanLimit: Joi.number().required(),
  extraLoanLimit: Joi.number().required(),
  bankRate: Joi.number().required(),
  extraBankRate: Joi.number().required(),
});

const addGame = Joi.object().keys({
  name: Joi.string().min(6).required(),
  maxPlayers: Joi.number().required(),
  tournament: Joi.boolean().default(false),
  scenario: Joi.string().default(null),
  maxPeriods: Joi.number().required(),
  password: Joi.string().default(null),
  periodDuration: Joi.number().required(),
});

const deleteGame = Joi.number().integer().min(0).required();

export default {
  addScenario,
  addGame,
  deleteGame,
};
