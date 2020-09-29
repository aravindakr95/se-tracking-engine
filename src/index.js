import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import chalk from 'chalk';

import config from './config/config';

import initializeDB from './helpers/database';

const app = express();

app.use(cors());
app.use(bodyParser.json());

initializeDB();

app.listen(config.serverPort, () => {
    console.log(chalk.magenta('-----------------------------------------------------------------------------'));
    console.log(chalk.yellow('Server Environment Details'));
    console.log(chalk.magenta('-----------------------------------------------------------------------------'));

    console.log(chalk.green(`Backend URL: ${config.serverHost}:${config.serverPort}`));
    console.log(chalk.green(`API Docs URL: ${config.serverHost}:${config.serverPort}/api-docs`));
    console.log(chalk.magenta('-----------------------------------------------------------------------------'));
    console.log(chalk.green.bold('SE Electricity Tracking Engine Server is up and running...'));
});
