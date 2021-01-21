import dotenv from 'dotenv';
import { version } from '../../package.json';

dotenv.config();

const config = {
    version,
    environment: 'prod', // dev, prod
    currency: 'LKR',
    supplier: 'CEB',
    adminToken: process.env.ADMIN_TOKEN,
    distributor: {
        gridSuccessUrl: 'http://apps2.malindaprasad.com/home/em/send.php',
        gridErrorUrl: 'http://apps2.malindaprasad.com/home/error',
        pvSuccessUrl: 'http://apps2.malindaprasad.com/home/solar/live-data.php'
    },
    inverter: {
        url: 'http://apiapp.le-pv.com:8080/api/equipDetail',
        serialNumber: process.env.RENAC_SN,
        email: process.env.RENAC_EMAIL
    },
    database: {
        prodUri: 'se-tracking-engine.jw1zk.mongodb.net',
        devUri: 'mongodb://127.0.0.1:27017',
        name: 'se-tracking-engine',
        user: 'admin',
        credentials: process.env.DB_CREDENTIALS
    },
    notifier: {
        admin: 'inquiries@brilliant-apps.club',
        mailAuthToken: process.env.POSTMARK_AUTH_TOKEN
    },
    authentication: {
        jwtSecret: process.env.JWT_AUTH_KEY,
        saltRounds: 10
    },
    deployment: {
        host: '127.0.0.1',
        port: process.env.PORT || 3000
    }
};

export default config;
