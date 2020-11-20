import config from '../config/config';

import HttpResponseType from '../models/common/http-response-type';

import { CustomException } from '../helpers/utilities/custom-exception';
import hashValidator from '../helpers/validators/hash-validator';
import jwtHandler from '../helpers/validators/token-handler';
import hasher from '../helpers/hasher';
import { sendEmailPostMark } from '../helpers/mail/mailer';
import { objectHandler } from '../helpers/utilities/normalize-request';
import { configSMS, configOTP, configOTPResponse, sendSMS } from '../helpers/sms/messenger';
import { getRegistrationSMSTemplate } from '../helpers/templates/sms/sms-broker';

export default function makeAuthEndPointHandler({ authList, consumerList }) {
    return async function handle(httpRequest) {
        switch (httpRequest.path) {
        case '/login':
            return loginConsumer(httpRequest);
        case '/register':
            return registerConsumer(httpRequest);
        case '/verify':
            return verifyConsumer(httpRequest);
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

            if (consumer && consumer.status === 'PENDING') {
                throw CustomException(
                    `Account number '${consumer.accountNumber}' is pending for verification`,
                    403
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
                        404
                    );
                }
            } else {
                throw CustomException(
                    'Invalid email or password',
                    401
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

        const otpDataset = configOTP(body.contactNumber);
        const otpOptions = {
            url: config.notifier.IBOTPSubscribe,
            method: 'post'
        };

        try {
            Object.assign(body, { password: hasher({ password: body.password }) });

            let consumer = await authList.addConsumer(body).catch(error => {
                throw CustomException(error.message);
            });

            if (!consumer) {
                throw CustomException(
                    `Consumer '${body.email}' pending account create failed`
                );
            }

            const otpRef = await sendSMS(otpOptions, otpDataset).then(response => {
                return response.data;
            }).catch(error => {
                throw CustomException(error.response.data); //todo: check and verify
            });

            if (otpRef && otpRef.statusCode !== 'SUCCESS') {
                throw CustomException(otpRef.message);
            }

            const { serverRef, msisdn } = otpRef.data;

            const tempConsumer = await authList.addConsumerOnPending({
                msisdn,
                email: body.email,
                serverRef
            }).catch(error => {
                throw CustomException(error.message);
            });

            if (!tempConsumer) {
                throw CustomException(
                    `Consumer '${body.email}' pending account failed to insert on database`
                );
            }

            return objectHandler({
                status: HttpResponseType.SUCCESS,
                message: `${consumer.email} account created and on hold`
            });
        } catch (error) {
            return objectHandler({
                code: error.code,
                message: error.message
            });
        }
    }

    async function verifyConsumer(httpRequest) {
        const { contactNumber, pin } = httpRequest.body;

        const smsOptions = {
            url: config.notifier.IBSMSOut,
            method: 'post'
        };
        const otpOptions = {
            url: config.notifier.IBOTPVerify,
            method: 'post'
        };

        try {
            let tempConsumer = await authList.findConsumerOnPending({ msisdn: contactNumber }).catch(error => {
                throw CustomException(error.message);
            });

            if (!tempConsumer) {
                throw CustomException(
                    'Contact number is invalid or not found in temporary consumer collection',
                    404
                );
            }

            const consumer = await authList.findConsumerByEmail({ email: tempConsumer.email }).catch(error => {
                throw CustomException(error.message);
            });

            const regTemplate = getRegistrationSMSTemplate({
                contactNumber: tempConsumer.msisdn,
                email: tempConsumer.email
            });
            const smsDataset = configSMS(contactNumber, regTemplate);

            const verifyDataset = configOTPResponse({ serverRef: tempConsumer.serverRef, pin });

            const verifyStatus = await sendSMS(otpOptions, verifyDataset).then(response => {
                return response.data;
            }).catch(error => {
                throw CustomException(error.response.data);
            });

            if (verifyStatus && verifyStatus.statusCode !== 'SUCCESS') {
                throw CustomException(verifyStatus.message);
            }

            const deviceToken = await jwtHandler(consumer).catch(error => {
                throw CustomException(error.message);
            });

            const activeStatus = await consumerList.updateConsumerStatusByContactNumber(
                { contactNumber: tempConsumer.msisdn },
                { status: 'ACTIVE', deviceToken }
            ).catch(error => {
                throw CustomException(error.message);
            });

            if (activeStatus && activeStatus.nModified < 1) {
                throw CustomException(`Contact number '${contactNumber}' activation failed`);
            }

            const removeStatus = await authList.removeConsumerOnPending({ msisdn: contactNumber })
                .catch(error => {
                    throw CustomException(error.message);
                });

            if (removeStatus && removeStatus.deletedCount) {

                //WARNING: limited resource use with care
                await sendSMS(smsOptions, smsDataset).catch(error => {
                    throw CustomException(error.message);
                });

                const templateConsumer = Object.assign(consumer, {
                    bodyTitle: `${config.supplier} Electricity EBILL Registration Completed`,
                    supplier: config.supplier
                });

                //WARNING: limited resource use with care
                await sendEmailPostMark(templateConsumer, 'registration-complete').catch(error => {
                    throw CustomException(error.message);
                });

                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    message: `${tempConsumer.email} account activated successful`
                });
            } else {
                throw CustomException('Temporary consumer delete failed');
            }
        } catch (error) {
            return objectHandler({
                code: error.code,
                message: error.message
            });
        }
    }
}
