import dotenv from 'dotenv';

dotenv.config();

const config = {
    environment: 'prod', // dev, prod
    currency: 'LKR',
    supplier: 'CEB',
    timezone: '+05:30',
    database: {
        url: 'se-tracking-engine.jw1zk.mongodb.net',
        name: 'se-tracking-engine',
        user: 'admin',
        credentials: process.env.DB_CREDENTIALS
    },
    notifier: {
        admin: 'inquiries@brilliant-apps.club',
        mailAuthToken: process.env.POSTMARK_AUTH_TOKEN,
        IBAuthToken: process.env.IDEABIZ_AUTH_TOKEN,
        IBSMSOut: process.env.IDEABIZ_SMS_OUT,
        IBOTPSubscribe: process.env.IDEABIZ_OTP_SUBSCRIBE,
        IBOTPVerify: process.env.IDEABIZ_OTP_VERIFY
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
