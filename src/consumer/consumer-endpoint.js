import HttpResponseType from '../models/common/http-response-type';

import { objectHandler } from '../helpers/utilities/normalize-request';

export default function makeConsumerEndpointHandler({ consumerList }) {
    return async function handle(httpRequest) {
        switch (httpRequest.method) {
        case 'GET':
            return httpRequest.queryParams.accountNumber || httpRequest.queryParams.deviceId ?
                getConsumer(httpRequest) : getConsumers(httpRequest);
        case 'PUT':
            return updateConsumer(httpRequest);
        case 'DELETE':
            return deleteConsumer(httpRequest);
        default:
            return objectHandler({
                code: HttpResponseType.METHOD_NOT_ALLOWED,
                message: `${httpRequest.method} method not allowed`
            });
        }
    };

    async function getConsumers(httpRequest) {
        const status = (httpRequest.queryParams) && (httpRequest.queryParams.status) ?
            httpRequest.queryParams.status : null;

        let result = null;

        if (status) {
            try {
                result = await consumerList.findConsumersByStatus({ status }).catch(error => {
                    throw error.message;
                });

                if (result && result.length) {
                    return objectHandler({
                        status: HttpResponseType.SUCCESS,
                        data: result,
                        message: ''
                    });
                } else {
                    throw 'Consumers collection is empty';
                }
            } catch (error) {
                return objectHandler({
                    code: HttpResponseType.INTERNAL_SERVER_ERROR,
                    message: error
                });
            }
        }

        try {
            result = await consumerList.getAllConsumers().catch(error => {
                throw error.message;
            });

            if (result && result.length) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: result,
                    message: ''
                });
            } else {
                throw 'Consumers collection is empty';
            }
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.INTERNAL_SERVER_ERROR,
                message: error
            });
        }
    }

    async function getConsumer(httpRequest) {
        let result = null;

        if (httpRequest.queryParams.accountNumber) {
            const { accountNumber } = httpRequest.queryParams;

            try {
                result = await consumerList.findConsumerByAccNumber(accountNumber).catch(error => {
                    throw error.message;
                });
                if (result) {
                    return objectHandler({
                        status: HttpResponseType.SUCCESS,
                        data: result,
                        message: ''
                    });
                } else {
                    throw `Requested Consumer account '${accountNumber}' not found`;
                }
            } catch (error) {
                return objectHandler({
                    code: HttpResponseType.INTERNAL_SERVER_ERROR,
                    message: error
                });
            }
        }

        if (httpRequest.queryParams.deviceId) {
            const { deviceId } = httpRequest.queryParams;

            try {
                result = await consumerList.findConsumerByDeviceId(deviceId).catch(error => {
                    throw error.message;
                });
                if (result) {
                    return objectHandler({
                        status: HttpResponseType.SUCCESS,
                        data: result,
                        message: ''
                    });
                } else {
                    throw `Requested Device Id '${deviceId}' not found`;
                }
            } catch (error) {
                return objectHandler({
                    code: HttpResponseType.INTERNAL_SERVER_ERROR,
                    message: error
                });
            }
        }
    }

    async function updateConsumer(httpRequest) {
        const body = httpRequest.body;
        const { accountNumber } = httpRequest.queryParams;

        try {
            const result = await consumerList.updateConsumerByAccNumber({ accountNumber }, body).catch(error => {
                throw error.message;
            });
            if (result) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: result,
                    message: `Consumer account '${accountNumber}' updated successful`
                });
            } else {
                throw `Consumer account '${accountNumber}' is not found`;
            }
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.INTERNAL_SERVER_ERROR,
                message: error
            });
        }
    }

    async function deleteConsumer(httpRequest) {
        const { accountNumber } = httpRequest.queryParams;

        let result = await consumerList.deleteConsumerByAccNumber({ accountNumber }).catch(error => {
            throw error.message;
        });

        if (result && result.deletedCount) {
            return objectHandler({
                status: HttpResponseType.SUCCESS,
                data: result,
                message: `Account number '${accountNumber}' record is deleted successful`
            });
        } else {
            throw `Requested Account number '${accountNumber}' not found`;
        }
    }
}
