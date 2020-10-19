import jwt from 'jsonwebtoken';

import config from '../config/config';
import HttpResponseType from '../models/common/http-response-type';

import { errorResponse } from '../helpers/response/response-dispatcher';
import { bypassHelper } from '../helpers/utilities/bypass';

import makeAuthList from '../auth/auth-list';

//token check middleware
export default function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (bypassHelper.shouldBypass(req)) {
        next();
    } else {
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            jwt.verify(token, config.jwtSecret, (error, user) => {
                const { email } = jwt.decode(token);

                validateProfile(email).then((valid) => {
                    if (valid) {
                        req.user = user;
                        next();
                    }
                });

                if (error) {
                    return errorResponse(res, {
                        code: HttpResponseType.FORBIDDEN,
                        message: error.message
                    });
                }
            });
        } else {
            return errorResponse(res, {
                code: HttpResponseType.AUTH_REQUIRED,
                message: 'Unauthorized to access this resource'
            });
        }
    }
}

async function validateProfile(email) {
    try {
        const authList = makeAuthList();
        const result = await authList.findByEmail({ email });

        return !!result;
    } catch (error) {
        return false;
    }
}
