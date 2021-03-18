/* -----------------------------------------------------
 * Smart Electricity Tracking Engine (SETE)
 * -----------------------------------------------------
 *
 * @author: Aravinda Rathnayake
 */

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';

import config from './config/config';

import logger from './config/log-level';

import HttpResponseType from './enums/http/http-response-type';

import initializeDB from './helpers/storage/database-handler';
import { errorResponse } from './helpers/http/response-dispatcher';

import authenticateJWT from './middlewares/auth-jwt';

import authRouter from './routes/auth';
import consumerRouter from './routes/consumer';
import pgsbRouter from './routes/pgsb';
import pvsbRouter from './routes/pvsb';
import summaryRouter from './routes/summary';
import forecastRouter from './routes/forecast';
import analysisRouter from './routes/analysis';
import metaRouter from './routes/meta';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(morgan('combined', { stream: logger.stream }));

initializeDB();

app.use('/v1/sete/auth', authRouter);
app.use('/v1/sete/consumers', consumerRouter);
app.use('/v1/sete/pgsb', pgsbRouter);
app.use('/v1/sete/pvsb', pvsbRouter);
app.use('/v1/sete/summary', summaryRouter);
app.use('/v1/sete/forecast', forecastRouter);
app.use('/v1/sete/analysis', analysisRouter);
app.use('/v1/sete/meta', metaRouter);

app.all('*',
  authenticateJWT,
  (req, res) => errorResponse(res, {
    code: HttpResponseType.NOT_FOUND,
    message: 'Request URL not found',
  }));

app.listen(config.deployment.port, () => {
  logger.info(`[index]: Listening URL: ${config.deployment.host}:${config.deployment.port}`);
  logger.info('[index]: API Docs URL: https://bit.ly/32lfoy2');
});
