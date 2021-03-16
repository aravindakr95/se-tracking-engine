import jwt from 'jsonwebtoken';

import config from '../../config/config';

function getAuthToken(consumer) {
  return jwt.sign({
    email: consumer.email,
    accountNumber: consumer.accountNumber,
  }, config.authentication.jwtSecret);
}

export default getAuthToken;
