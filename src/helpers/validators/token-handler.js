import jwt from 'jsonwebtoken';

import config from '../../config/config';

export default async function getAuthToken(user) {
    return jwt.sign({
        email: user.email,
        supplier: user.supplier,
        accountNumber: user.accountNumber,
        premiseId: user.premiseId
    }, config.jwtSecret);
}
