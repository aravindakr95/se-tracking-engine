import express from 'express';

import forecastController from '../forecast/forecast-controller';
import { fieldStateChecker, validate } from '../middlewares/field-validator';

let forecastRouter = express.Router();

forecastRouter.post('/reports/generate',
    validate('forecast', '/reports/generate', 'POST'),
    fieldStateChecker,
    (req, res) => {
        forecastController(req, res);
    });

module.exports = forecastRouter;
