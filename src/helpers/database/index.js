import mongoose from 'mongoose';

import config from '../../config/config';

export default async function initializeDB() {
    let dbUrl = null;

    if (config.environment === 'prod') {
        dbUrl = `mongodb+srv://${config.database.user}:${config.database.credentials}@
        ${config.database.url}/${config.database.name}?retryWrites=true&w=majority`;
    } else {
        dbUrl = `${config.database.url}/${config.database.name}?retryWrites=true&w=majority`;
    }

    mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    }).then(() => {
        console.log(`Connected to ${dbUrl}`);
    }).catch((error) => {
        console.log(`Database starting error: ${error.message}`);

        process.exit(1);
    });

    let database = mongoose.connection;

    database.once('open', () => console.log('Database connection is opened'));

    database.on('error', () => {
        console.log('Database connection error');
    });

    return database;
}
