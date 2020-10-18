import hashValidator from '../helpers/validators/hash-validator';

import jwtHandler from '../helpers/validators/token-handler';
import hasher from '../helpers/hasher';

import HttpResponseType from '../models/http-response-type';
import sendEmail from '../helpers/mail/mailer';
import config from '../config/config';
import { objectHandler } from '../helpers/utilities/normalize-request';
import { configSMS, sendSMS } from '../helpers/sms/messenger';

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
        let validPassword = false;
        const { email, password } = httpRequest.body;

        try {
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
                const { email } = user;
                let accessToken = await jwtHandler(user);

                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: { accessToken },
                    message: `User '${email}' authentication successful`
                });
            } else {
                return objectHandler({
                    code: HttpResponseType.CLIENT_ERROR,
                    message: 'Invalid email or password'
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
        const body = httpRequest.body;

        try {
            Object.assign(body, { password: hasher({ password: body.password }) });
            let user = await authList.addUser(body);

            const message = 'Registration successful. ' +
                'You will keep receiving monthly Electricity Statement each month ending day through a SMS and Email';
            const mobile = `+94${body.contactNumber.substring(1)}`;
            const dataset = configSMS(mobile, message);
            const options = {
                url: 'https://ideabiz.lk/apicall/smsmessaging/v3/outbound/SETE/requests',
                method: 'post'
            };

            //WARNING: limited resource use with care
            const smsStatus = await sendSMS(options, dataset)
                .then(response => {
                    return true
                })
                .catch(error => {
                    console.log(error)
                    return error;
                });

            //WARNING: limited resource use with care
            const emailStatus = await sendEmail({
                from: config.adminEmail,
                to: user.email,
                subject: 'SETE Registration',
                text: message,
                html: ''
            }).then(response => {
                return true;
            }).catch(error => {
                console.log(error);
                return error
            });

            if (smsStatus && emailStatus) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    message: `${user.email} account created successful`
                });
            } else {
                return objectHandler({
                    status: HttpResponseType.INTERNAL_SERVER_ERROR,
                    message: 'Registration Email or SMS sending failed'
                });
            }
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.CLIENT_ERROR,
                message: error.code === 11000 ? `Email '${body.email}' or unique property already exists` :
                    error.message
            });
        }
    }
}
