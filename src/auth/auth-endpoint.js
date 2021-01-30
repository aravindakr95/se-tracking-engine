import config from '../config/config';

import HttpResponseType from '../enums/http/http-response-type';
import AccountStatus from '../enums/account/account-status';

import { CustomException } from '../helpers/utilities/custom-exception';
import hashValidator from '../helpers/validators/hash-validator';
import hasher from '../helpers/hasher';
import jwtHandler from '../helpers/validators/token-handler';
import { objectHandler } from '../helpers/utilities/normalize-request';
import { sendEmailPostMark } from '../helpers/mail/mailer';

export default function makeAuthEndPointHandler({ authList }) {
    return async function handle(httpRequest) {
        switch (httpRequest.path) {
        case '/login':
            return loginConsumer(httpRequest);
        case '/register':
            return registerConsumer(httpRequest);
        default:
            return objectHandler({
                code: HttpResponseType.METHOD_NOT_ALLOWED,
                message: `${httpRequest.method} method not allowed`
            });
        }
    };

    async function loginConsumer(httpRequest) {
        let isValidPw = false;
        const { email, password } = httpRequest.body;

        try {
            let consumer = await authList.findConsumerByEmail({ email }).catch(error => {
                throw CustomException(error.message);
            });

            if (consumer && consumer.status === AccountStatus.INACTIVE) {
                throw CustomException(
                    `Account number '${consumer.accountNumber}' is pending for verification`,
                    HttpResponseType.FORBIDDEN
                );
            }

            if (consumer) {
                isValidPw = await hashValidator({
                    password,
                    hash: consumer.password
                });
            }

            if (isValidPw) {
                const { deviceToken } = consumer;

                if (deviceToken) {
                    return objectHandler({
                        status: HttpResponseType.SUCCESS,
                        data: { accessToken: deviceToken },
                        message: `Consumer '${email}' authentication successful`
                    });
                } else {
                    throw CustomException(
                        'Device token not found in the database',
                        HttpResponseType.NOT_FOUND
                    );
                }
            } else {
                throw CustomException(
                    'Invalid email or password',
                    HttpResponseType.AUTH_REQUIRED
                );
            }
        } catch (error) {
            return objectHandler({
                code: error.code,
                message: error.message
            });
        }
    }

    async function registerConsumer(httpRequest) {
        const body = httpRequest.body;

        try {
            const deviceToken = await jwtHandler(body).catch(error => {
                throw CustomException(error.message);
            });

            const editedFields = {
                password: hasher({ password: body.password }),
                deviceToken
            };

            Object.assign(body, editedFields);

            let consumer = await authList.addConsumer(body).catch(error => {
                throw CustomException(error.message);
            });

            const templateConsumer = Object.assign(consumer, {
                bodyTitle: `${config.supplier} Electricity EBILL Registration Completed`,
                supplier: config.supplier
            });

            if (!consumer) {
                throw CustomException(
                    `Consumer '${body.email}' account create failed`
                );
            }

            //WARNING: limited resource use with care
            await sendEmailPostMark(templateConsumer, 'registration-complete').catch(error => {
                throw CustomException(error.message);
            });

            return objectHandler({
                status: HttpResponseType.SUCCESS,
                message: `${consumer.email} account created successful`
            });
        } catch (error) {
            return objectHandler({
                code: error.code,
                message: error.message
            });
        }
    }
}
