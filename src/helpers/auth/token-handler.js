import { sign, verify, decode } from 'jsonwebtoken';

import config from '../../config/config';

function signAuthToken(consumer) {
  return sign({
    email: consumer.email,
    accountNumber: consumer.accountNumber,
  }, config.authentication.jwtSecret);
}

function verifyAuthToken(token) {
  return verify(token, config.authentication.jwtSecret,
    (error, consumer) => error || consumer);
}

function decodeAuthToken(token) {
  const { email } = decode(token);
  return email;
}

export { signAuthToken, verifyAuthToken, decodeAuthToken };
