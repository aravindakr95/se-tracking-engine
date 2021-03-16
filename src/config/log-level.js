import appRoot from 'app-root-path';
import winston from 'winston';
import dailyRotateFile from 'winston-daily-rotate-file';

import config from './config';

import EnvironmentType from '../enums/common/environment-type';

// define the custom settings for each transport (file, console)
const options = {
  file: {
    level: 'info',
    filename: `${appRoot}/logs/${config.environment.toLowerCase()}/%DATE%.log`,
    datePattern: 'MM-DD-YYYY-HH',
    zippedArchive: true,
    handleExceptions: true,
    json: true,
    maxsize: '20m',
    maxFiles: '14d',
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: true,
    colorize: true,
  },
};

// instantiate a new Winston Logger with the settings defined above
const logger = new winston.createLogger({
  level: 'info',
  transports: [
    new dailyRotateFile(options.file),
    new winston.transports.Console(options.console),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

logger.stream = {
  write: (message) => {
    logger.info(message);
  },
};

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//

if (config.environment !== EnvironmentType.PRODUCTION) {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
