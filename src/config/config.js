import dotenv from 'dotenv';

dotenv.config();

const config = {
    databaseUrl: process.env.DB_URL_PROD || process.env.DB_URL_LOCAL,
    databaseName: process.env.DATABASE_NAME,
    serverHost: process.env.HOST || process.env.SERVER_HOST,
    serverPort: process.env.PORT || process.env.SERVER_PORT,
    jwtSecret: process.env.JWT_SECRET_KEY,
    saltRounds: process.env.BCRYPT_ROUNDS,
    sendGridApiKey: process.env.SENDGRID_API_KEY,
    adminEmail: process.env.ADMIN_EMAIL,
    ideabizAuthToken: process.env.IDEABIZ_AUTH_TOKEN,
    ideabizSMSOut: process.env.IDEABIZ_SMS_OUT,
    ideabizOTPSubscribe: process.env.IDEABIZ_OTP_SUBSCRIBE,
    ideabizOTPVerify: process.env.IDEABIZ_OTP_VERIFY,
    currency: process.env.CURRENCY
};

export default config;
