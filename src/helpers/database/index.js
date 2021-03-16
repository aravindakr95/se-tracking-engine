import { connect, connection } from 'mongoose';

import config from '../../config/config';

import EnvironmentType from '../../enums/common/environment-type';

export default async function initializeDB() {
    let uri = null;

    if (config.environment === EnvironmentType.PRODUCTION) {
        uri = `mongodb+srv://${config.database.user}:${config.database.credentials}` +
            `@se-tracking-engine.jw1zk.mongodb.net/${config.database.name}?retryWrites=true&w=majority`;
    } else {
        uri = `${config.database.devUri}/${config.database.name}?retryWrites=true&w=majority`;
    }

    await connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    }).then(() => {
        console.log(`Connected to ${uri}`);
    }).catch((error) => {
        console.log(`Database starting error: ${error.message}`);

        process.exit(1);
    });

    let database = connection;

    database.once('open', () => console.log('Database connection is opened'));

    database.on('error', () => {
        console.log('Database connection error');
    });

    return database;
}
