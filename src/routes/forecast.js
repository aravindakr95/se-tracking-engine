import express from 'express';

import forecastController from '../forecast/forecast-controller';
import { fieldStateChecker, validate } from '../middlewares/field-validator';

import authenticateJWT from '../middlewares/auth-jwt';

const forecastRouter = express.Router();

forecastRouter.post('/reports/generate',
  authenticateJWT,
  validate('forecast', '/reports/generate', 'POST'),
  fieldStateChecker,
  (req, res) => {
    forecastController(req, res);
  });

export default forecastRouter;
