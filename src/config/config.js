import dotenv from 'dotenv';

import { version } from '../../package.json';

import EnvironmentType from '../enums/common/environment-type';

dotenv.config();

const config = {
  version,
  environment: EnvironmentType.PRODUCTION, // PRODUCTION, DEVELOPMENT
  currency: 'LKR',
  supplier: 'CEB',
  adminToken: process.env.ADMIN_TOKEN,
  prices: {
    fixed: {
      blockOne: 30.00,
      blockTwo: 60.00,
      blockThree: 90.00,
      blockFour: 480.00,
      blockFive: 540.00,
    },
    import: {
      blockOne: 2.50,
      blockTwo: 4.85,
      blockThree: 7.85,
      blockFour: 10.00,
      blockFive: 27.75,
      blockSix: 32.00,
      blockSeven: 45.00,
    },
    export: {
      blockOne: 15.50,
      blockTwo: 22.00,
    },
  },
  distributor: {
    isAllowed: true,
    gridSuccessUrl: process.env.GRID_SUCCESS_URL,
    gridErrorUrl: process.env.GRID_ERROR_URL,
    pvSuccessUrl: process.env.PV_SUCCESS_URL,
  },
  inverter: {
    url: process.env.INVERTER_URL,
    serialNumber: process.env.RENAC_SN,
    email: process.env.RENAC_EMAIL,
  },
  database: {
    prodUri: process.env.PROD_URI,
    devUri: 'mongodb://127.0.0.1:27017',
    name: 'se-tracking-engine',
    user: 'admin',
    credentials: process.env.DB_CREDENTIALS,
  },
  notifier: {
    admin: 'inquiries@brilliant-apps.club',
    mailAuthToken: process.env.POSTMARK_AUTH_TOKEN,
  },
  authentication: {
    jwtSecret: process.env.JWT_AUTH_KEY,
    saltRounds: 10,
  },
  deployment: {
    host: '127.0.0.1',
    port: process.env.PORT || 3000,
  },
};

export default config;
