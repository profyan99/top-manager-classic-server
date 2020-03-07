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
  maxPlayers: Joi.number().min(2).max(8).required(),
  tournament: Joi.boolean().default(false),
  scenario: Joi.string().min(6).default(null),
  maxRounds: Joi.number().min(2).required(),
  password: Joi.string().min(6).default(null),
  periodDuration: Joi.number().required(),
});

const deleteGame = Joi.number().integer().min(0).required();

export default {
  addScenario,
  addGame,
  deleteGame,
};
