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
    ideabizAuthToken: 'fglEm1ZVF4vxXQhH7rb6Or46dWEa'
};

export default config;
