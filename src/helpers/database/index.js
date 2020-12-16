import { connect, connection } from 'mongoose';

import config from '../../config/config';

export default async function initializeDB() {
    let uri = null;

    if (config.environment === 'prod') {
        uri = `mongodb+srv://${config.database.user}:${config.database.credentials}` +
            `@se-tracking-engine.jw1zk.mongodb.net/${config.database.name}?retryWrites=true&w=majority`;
    }

    if (config.environment === 'dev') {
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
