import { connect } from 'mongoose';

import config from '../../config/config';

import logger from '../../config/log-level';

import EnvironmentType from '../../enums/common/environment-type';

export default function initializeDB() {
  logger.info('[storage][databaseHandler]: Start');
  let uri = null;

  if (config.environment === EnvironmentType.PRODUCTION) {
    uri = `mongodb+srv://se-tracking-engine.jw1zk.mongodb.net/${config.database.name}?retryWrites=true&w=majority`;
    connect(uri, {
      user: config.database.user,
      pass: encodeURIComponent(config.database.credentials),
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }).then(() => {
      logger.info(`[storage][databaseHandler]: Connected to ${uri}`);
      logger.info('[storage][databaseHandler]: Finish');
    }).catch((error) => {
      logger.error(`Database starting error: ${error.message}`);
      logger.info('[storage][databaseHandler]: Finish');
      process.exit(1);
    });
  } else {
    uri = `${config.database.devUri}/${config.database.name}?retryWrites=true&w=majority`;
    connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }).then(() => {
      logger.info(`[storage][databaseHandler]: Connected to ${uri}`);
      logger.info('[storage][databaseHandler]: Finish');
    }).catch((error) => {
      logger.error(`Database starting error: ${error.message}`);
      logger.info('[storage][databaseHandler]: Finish');
      process.exit(1);
    });
  }
}
