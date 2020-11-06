import jwt from 'jsonwebtoken';

import config from '../../config/config';

export default async function getAuthToken(consumer) {
    return jwt.sign({
        email: consumer.email,
        accountNumber: consumer.accountNumber
    }, config.authentication.jwtSecret);
}
