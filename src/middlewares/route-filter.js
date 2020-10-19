import jwt from 'jsonwebtoken';

import config from '../config/config';
import HttpResponseType from '../models/common/http-response-type';

import { errorResponse } from '../helpers/response/response-dispatcher';
import { bypassHelper } from '../helpers/utilities/bypass';

//token check middleware
export default function filterRoute(req, res, next) {
    const authHeader = req.headers.authorization;

    if (bypassHelper.shouldBypass(req)) {
        next();
    } else {
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            jwt.verify(token, config.jwtSecret, (error, user) => {
                if (error) {
                    return errorResponse(res, {
                        code: HttpResponseType.FORBIDDEN,
                        message: error.message
                    });
                }

                if (user.status === 'PENDING') {
                    return errorResponse(res, {
                        code: HttpResponseType.FORBIDDEN,
                        message: 'User is pending for verification'
                    });
                }

                next();
            });
        } else {
            return errorResponse(res, {
                code: HttpResponseType.AUTH_REQUIRED,
                message: 'Unauthorized to access this resource'
            });
        }
    }
}
