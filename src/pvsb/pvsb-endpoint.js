import HttpResponseType from '../models/common/http-response-type';

import { objectHandler } from '../helpers/utilities/normalize-request';

export default function makePVSBEndPointHandler({ pvsbList, consumerList }) {
    return async function handle(httpRequest) {
        switch (httpRequest.path) {
        case '/payloads':
            return httpRequest.queryParams && httpRequest.queryParams.accountNumber ? getConsumerPVStats(httpRequest) :
                addPVStat(httpRequest);
        case '/errors':
            return addPVError(httpRequest);
        default:
            return objectHandler({
                code: HttpResponseType.METHOD_NOT_ALLOWED,
                message: `${httpRequest.method} method not allowed`
            });
        }
    };

    async function addPVStat(httpRequest) {
        const body = httpRequest.body;
        const { deviceId } = httpRequest.queryParams;

        try {
            const customPayload = pvsbList.mapPayload(deviceId, body);

            if (!customPayload) {
                throw 'Custom payload is empty';
            }

            const result = await pvsbList.addPVStats(customPayload).catch(error => {
                throw error.message;
            });

            if (result) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: null,
                    message: `PVSB '${result.deviceId}' payload statistics received`
                });
            }
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.CLIENT_ERROR,
                message: error
            });
        }
    }

    async function getConsumerPVStats(httpRequest) {
        const { accountNumber } = httpRequest.queryParams;

        try {
            const consumer = await consumerList.findConsumerByAccNumber(accountNumber).catch(error => {
                throw error.message;
            });

            if (!consumer) {
                throw `Requested account number '${accountNumber}' is not exists`;
            }

            const deviceId = await consumerList.findDeviceIdByAccNumber(accountNumber, 'PVSB')
                .catch(error => {
                    throw error.message;
                });

            if (!deviceId) {
                throw `PVSB Device Id '${accountNumber}' is not exists for account '${accountNumber}'`;
            }

            const result = await pvsbList.findAllPVStatsByDeviceId({ deviceId }).catch(error => {
                throw error.message;
            });

            if (result && result.length) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: result,
                    message: ''
                });
            } else {
                throw `Requested consumer account '${accountNumber}' PV statistics not found`;
            }
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.INTERNAL_SERVER_ERROR,
                message: error
            });
        }
    }

    async function addPVError(httpRequest) {
        const body = httpRequest.body;
        const { deviceId } = httpRequest.queryParams;

        try {
            Object.assign(body, { deviceId });
            const payload = await pvsbList.addPVError(body).catch(error => {
                throw error.message;
            });

            if (payload) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    message: `PVSB '${deviceId}' error log received`
                });
            }
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.CLIENT_ERROR,
                message: error
            });
        }
    }
}
