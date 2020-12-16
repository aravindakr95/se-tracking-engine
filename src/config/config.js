import dotenv from 'dotenv';

dotenv.config();

const config = {
    environment: 'dev', // dev, prod
    currency: 'LKR',
    supplier: 'CEB',
    timezone: '+05:30',
    adminToken: '3c31292i0t20mdp6s8hgg4y2tvc0iy',
    inverter: {
        url: 'http://apiapp.le-pv.com:8080/api/equipDetail',
        serialNumber: process.env.RENAC_SN,
        email: process.env.RENAC_EMAIL
    },
    database: {
        url: 'mongodb://127.0.0.1:27017', // mongodb://127.0.0.1:27017
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
