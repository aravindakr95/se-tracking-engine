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

            if (token) {
                jwt.verify(token, config.authentication.jwtSecret, (error, consumer) => {
                    const decodedToken = jwt.decode(token);

                    if (error) {
                        console.log(error);
                        return errorResponse(res, {
                            code: HttpResponseType.FORBIDDEN,
                            message: error.message
                        });
                    }

                    if (decodedToken && decodedToken.email) {
                        validateProfile(decodedToken.email).then((valid) => {
                            if (valid) {
                                req.consumer = consumer;
                                next();
                            } else {
                                return errorResponse(res, {
                                    code: HttpResponseType.AUTH_REQUIRED,
                                    message: 'Present Authorization header does not allowed'
                                });
                            }
                        });
                    } else {
                        return errorResponse(res, {
                            code: HttpResponseType.AUTH_REQUIRED,
                            message: 'Required fields are not available to authenticate'
                        });
                    }
                });
            } else {
                return errorResponse(res, {
                    code: HttpResponseType.AUTH_REQUIRED,
                    message: 'Bearer token is not presented or invalid format'
                });
            }
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
        const result = await authList.findConsumerByEmail({ email });

        return !!result;
    } catch (error) {
        return false;
    }
}
