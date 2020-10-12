import hashValidator from '../helpers/validators/hash-validator';

import jwtHandler from '../helpers/validators/token-handler';
import hasher from '../helpers/hasher';

import HttpResponseType from '../models/http-response-type';
import sendEmail from '../helpers/mail/mailer';
import config from '../config/config';
import { objectHandler } from '../helpers/utilities/normalize-request';

export default function makeAuthEndPointHandler({ authList }) {
    return async function handle(httpRequest) {
        switch (httpRequest.path) {
            case '/login':
                return loginUser(httpRequest);
            case '/register':
                return registerUser(httpRequest);
            default:
                return objectHandler({
                    code: HttpResponseType.METHOD_NOT_ALLOWED,
                    message: `${httpRequest.method} method not allowed`
                });
        }
    };

    async function loginUser(httpRequest) {
        try {
            let validPassword = false;
            const { email, password } = httpRequest.body;
            if (email) {
                let user = await authList.findByEmail({
                    email
                });

                if (user) {
                    validPassword = await hashValidator({
                        password,
                        hash: user.password
                    });
                }

                if (validPassword) {
                    let accessToken = await jwtHandler(user);
                    const { _id, email } = user;

                    return objectHandler({
                        status: HttpResponseType.SUCCESS,
                        data: {
                            _id,
                            email,
                            accessToken
                        },
                        message: `User authentication successful`
                    });
                } else {
                    return objectHandler({
                        code: HttpResponseType.CLIENT_ERROR,
                        message: 'Invalid email or password'
                    });
                }
            } else {
                return objectHandler({
                    code: HttpResponseType.CLIENT_ERROR,
                    message: 'Request body does not contain a body'
                });
            }

        } catch (error) {
            return objectHandler({
                code: HttpResponseType.CLIENT_ERROR,
                message: error.message
            });
        }
    }

    async function registerUser(httpRequest) {
        const {
            email,
            password,
            nic,
            contactNumber,
            supplier,
            accountNumber,
            premiseId
        } = httpRequest.body;

        try {
            if (httpRequest.body) {
                const userObj = {
                    email,
                    password: hasher({
                        password
                    }),
                    nic,
                    contactNumber,
                    supplier,
                    accountNumber,
                    premiseId
                };

                let user = await authList.addUser(userObj);

                await sendEmail({
                    from: config.adminEmail,
                    to: user.email,
                    subject: 'Registration successful',
                    text: 'Registration successful. Thanks for choosing our store.',
                    html: ''
                });

                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    message: `${user.email} account created successful`
                });
            } else {
                return objectHandler({
                    code: HttpResponseType.CLIENT_ERROR,
                    message: 'Request body does not contain a body'
                });
            }
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.CLIENT_ERROR,
                message: error.code === 11000 ? `Email '${email}' is already exists` : error.message
            });
        }
    }
}
