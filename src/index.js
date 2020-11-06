import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import chalk from 'chalk';

import config from './config/config';

import initializeDB from './helpers/database';

import { errorResponse } from './helpers/response/response-dispatcher';

import authRouter from './routes/auth';
import consumerRouter from './routes/consumer';
import pgsbRouter from './routes/pgsb';
import pvsbRouter from './routes/pvsb';
import analysisRouter from './routes/analysis';

import HttpResponseType from './models/common/http-response-type';
import authenticateJWT from './middlewares/auth';

const app = express();

app.use(cors());
app.use(bodyParser.json());

initializeDB();

app.use('/v1/sete/auth', authRouter);
app.use('/v1/sete/consumers', authenticateJWT, consumerRouter);
app.use('/v1/sete/pgsb', authenticateJWT, pgsbRouter);
app.use('/v1/sete/pvsb', authenticateJWT, pvsbRouter);
app.use('/v1/sete/analysis', authenticateJWT, analysisRouter);

app.all('*', (req, res) => {
    return errorResponse(res, {
        code: HttpResponseType.NOT_FOUND,
        message: 'Request URL not found'
    });
});

app.listen(config.deployment.port, () => {
    console.log(chalk.magenta('-----------------------------------------------------------------------------'));
    console.log(chalk.yellow('Server Environment Details'));
    console.log(chalk.magenta('-----------------------------------------------------------------------------'));

    console.log(chalk.green(`Listening URL: ${config.deployment.host}:${config.deployment.port}`));
    console.log(chalk.green('API Docs URL: https://bit.ly/32lfoy2'));
    console.log(chalk.magenta('-----------------------------------------------------------------------------'));
    console.log(chalk.green.bold('Smart Electricity Tracking Engine (SETE) is up and running...'));
});
