import swaggerJsdoc from 'swagger-jsdoc';
import config from './config/config';

const options = {
    apis: ['src/routes/*.js'],
    basePath: '/',
    host: `${config.serverHost}:${config.serverPort}`,
    swaggerDefinition: {
        info: {
            description: 'Automated API Documentation for Smart Electricity Tracking Engine',
            title: 'SETE API Documentation',
            version: '1.0.0',
        }
    }
};
const specs = swaggerJsdoc(options);

export default specs;
