import dotenv from 'dotenv';

dotenv.config();

const config = {
    environment: 'prod', // dev, prod
    currency: 'LKR',
    supplier: 'CEB',
    database: {
        url: 'mongodb+srv://admin:Pvugy10qZ3jLZrfm@se-tracking-engine.jw1zk.mongodb.net',
        name: 'se-tracking-engine'
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
        host: process.env.HOST || '192.168.1.8',
        port: process.env.PORT || 4000
    }
};

export default config;
