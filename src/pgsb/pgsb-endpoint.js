import HttpResponseType from '../models/common/http-response-type';

import { CustomException } from '../helpers/utilities/custom-exception';
import { objectHandler } from '../helpers/utilities/normalize-request';

export default function makePGSBEndPointHandler({ pgsbList, consumerList }) {
    return async function handle(httpRequest) {
        switch (httpRequest.path) {
        case '/payloads':
            return httpRequest.queryParams && httpRequest.queryParams.accountNumber ? getConsumerPGStats(httpRequest) :
                addPGStat(httpRequest);
        case '/errors':
            return addPGError(httpRequest);
        default:
            return objectHandler({
                code: HttpResponseType.METHOD_NOT_ALLOWED,
                message: `${httpRequest.method} method not allowed`
            });
        }
    };

    async function addPGStat(httpRequest) {
        const body = httpRequest.body;
        const { deviceId, slaveId } = httpRequest.queryParams;

        try {
            Object.assign(body, { deviceId, slaveId });
            const payload = await pgsbList.addPGStats(body).catch(error => {
                throw CustomException(error.message);
            });

            if (payload) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    message: `PGSB ${deviceId} payload statistics received`
                });
            }
        } catch (error) {
            return objectHandler({
                code: error.code,
                message: error.message
            });
        }
    }

    async function getConsumerPGStats(httpRequest) {
        const { accountNumber } = httpRequest.queryParams;

        try {
            const consumer = await consumerList.findConsumerByAccNumber(accountNumber).catch(error => {
                throw CustomException(error.message);
            });

            if (!consumer) {
                throw CustomException(
                    `Requested account number '${accountNumber}' is not exists`,
                    HttpResponseType.NOT_FOUND
                );
            }

            const deviceId = await consumerList.findDeviceIdByAccNumber(accountNumber, 'PGSB')
                .catch(error => {
                    throw CustomException(error.message);
                });

            if (!deviceId) {
                throw CustomException(
                    `PGSB Device Id '${deviceId}' is not exists for account '${accountNumber}'`,
                    HttpResponseType.NOT_FOUND
                );
            }

            const result = await pgsbList.findAllPGStatsByDeviceId({ deviceId }).catch(error => {
                throw CustomException(error.message);
            });

            if (result && result.length) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: result,
                    message: ''
                });
            } else {
                throw CustomException(
                    `Requested consumer account '${accountNumber}' PG statistics not found`,
                    HttpResponseType.NOT_FOUND
                );
            }
        } catch (error) {
            return objectHandler({
                code: error.code,
                message: error.message
            });
        }
    }

    async function addPGError(httpRequest) {
        const body = httpRequest.body;
        const { deviceId } = httpRequest.queryParams;

        try {
            Object.assign(body, { deviceId });
            const payload = await pgsbList.addPGError(body).catch(error => {
                throw CustomException(error.message);
            });

            if (payload) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    message: `PGSB ${deviceId} error log received`
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
