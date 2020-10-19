import hashValidator from '../helpers/validators/hash-validator';

import jwtHandler from '../helpers/validators/token-handler';
import hasher from '../helpers/hasher';

import HttpResponseType from '../models/common/http-response-type';
import sendEmail from '../helpers/mail/mailer';
import config from '../config/config';
import { objectHandler } from '../helpers/utilities/normalize-request';
import { configSMS, configOTP, configOTPResponse, sendSMS } from '../helpers/sms/messenger';

export default function makeAuthEndPointHandler({ authList, userList }) {
    return async function handle(httpRequest) {
        switch (httpRequest.path) {
            case '/login':
                return loginUser(httpRequest);
            case '/register':
                return registerUser(httpRequest);
            case '/verify':
                return verifyUser(httpRequest);
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
            let user = await authList.findByEmail({ email });

            if (user && user.status === 'PENDING') {
                return objectHandler({
                    code: HttpResponseType.FORBIDDEN,
                    message: `Account number '${user.accountNumber}' is pending for verification`
                });
            }

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

        const otpDataset = configOTP(body.contactNumber);
        const otpOptions = {
            url: 'https://ideabiz.lk/apicall/pin/subscription/v1/subscribe',
            method: 'post'
        };

        try {
            Object.assign(body, { password: hasher({ password: body.password }) });

            let user = await authList.addUser(body);

            if (!user) {
                return objectHandler({
                    code: HttpResponseType.INTERNAL_SERVER_ERROR,
                    message: `User '${body.email}' pending account create failed`
                });
            }

            const otpRef = await sendSMS(otpOptions, otpDataset).then(response => {
                return response.data
            }).catch(error => {
                return error.response.data
            });

            if (!otpRef || (otpRef && otpRef.statusCode !== 'SUCCESS')) {
                return objectHandler({
                    code: HttpResponseType.INTERNAL_SERVER_ERROR,
                    message: otpRef.message
                });
            }

            const { serverRef, msisdn } = otpRef.data;

            const tempUser = await authList.addUserOnPending({
                msisdn,
                email: body.email,
                serverRef
            });

            if (!tempUser) {
                return objectHandler({
                    code: HttpResponseType.INTERNAL_SERVER_ERROR,
                    message: `User '${body.email}' pending user failed to insert on database`
                });
            }

            return objectHandler({
                status: HttpResponseType.SUCCESS,
                message: `${user.email} account created and on hold`
            });
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.CLIENT_ERROR,
                message: error.code === 11000 ? `Email '${body.email}' or unique property already exists` :
                    error.message
            });
        }
    }

    async function verifyUser(httpRequest) {
        const { contactNumber, pin } = httpRequest.body;

        const message = 'Registration successful. ' +
            'You will keep receiving monthly Electricity Statement each month ending day through a SMS and Email';
        const smsDataset = configSMS(contactNumber, message);
        const smsOptions = {
            url: 'https://ideabiz.lk/apicall/smsmessaging/v3/outbound/SETE/requests',
            method: 'post'
        };
        const otpOptions = {
            url: 'https://ideabiz.lk/apicall/pin/subscription/v1/submitPin',
            method: 'post'
        };

        try {
            let tempUser = await authList.findUserOnPending({ msisdn: contactNumber });

            if (!tempUser) {
                return objectHandler({
                    code: HttpResponseType.NOT_FOUND,
                    message: 'Contact number is invalid or not found in temporary user collection'
                });
            }

            const verifyDataset = configOTPResponse({ serverRef: tempUser.serverRef, pin });

            const verifyStatus = await sendSMS(otpOptions, verifyDataset).then(response => {
                return response.data
            }).catch(error => {
                return error.response.data
            });

            if (!verifyStatus || (verifyStatus && verifyStatus.statusCode !== 'SUCCESS')) {
                return objectHandler({
                    code: HttpResponseType.INTERNAL_SERVER_ERROR,
                    message: verifyStatus.message
                });
            }

            const activeStatus = await userList.updateUserStatusByContactNumber(
                { contactNumber: tempUser.msisdn },
                { status: 'ACTIVE' }
            );

            if (activeStatus && activeStatus.nModified < 1) {
                return objectHandler({
                    code: HttpResponseType.INTERNAL_SERVER_ERROR,
                    message: `Contact number '${contactNumber}' activation failed`
                });
            }

            const removeStatus = await authList.removeUserOnPending({ msisdn: contactNumber });

            if (removeStatus && removeStatus.deletedCount) {

                //WARNING: limited resource use with care
                const smsStatus = await sendSMS(smsOptions, smsDataset)
                    .then(() => {
                        return true
                    })
                    .catch(error => {
                        console.log(error)
                        return error;
                    });

                //WARNING: limited resource use with care
                const emailStatus = await sendEmail({
                    from: config.adminEmail,
                    to: tempUser.email,
                    subject: 'SETE Registration',
                    text: message,
                    html: ''
                }).then(() => {
                    return true;
                }).catch(error => {
                    console.log(error);
                    return error
                });

                if (smsStatus === true && emailStatus === true) {
                    return objectHandler({
                        status: HttpResponseType.SUCCESS,
                        message: `${tempUser.email} account activated successful`
                    });
                } else {
                    return objectHandler({
                        code: HttpResponseType.INTERNAL_SERVER_ERROR,
                        message: 'Registration Email or SMS sending failed'
                    });
                }
            } else {
                return objectHandler({
                    code: HttpResponseType.INTERNAL_SERVER_ERROR,
                    message: 'Temporary user delete failed'
                });
            }
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.INTERNAL_SERVER_ERROR,
                message: error.message
            });
        }
    }
}
