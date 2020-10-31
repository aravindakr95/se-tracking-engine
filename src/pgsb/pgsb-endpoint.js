import HttpResponseType from '../models/common/http-response-type';

import { objectHandler } from '../helpers/utilities/normalize-request';

export default function makePGSBEndPointHandler({ pgsbList, consumerList }) {
    return async function handle(httpRequest) {
        switch (httpRequest.path) {
            case '/payloads':
                return httpRequest.queryParams && httpRequest.queryParams.accountNumber ? getConsumerPGStats(httpRequest) :
                    addPGStat(httpRequest);
            case '/errors':
                return addPGError(httpRequest)
            default:
                return objectHandler({
                    code: HttpResponseType.METHOD_NOT_ALLOWED,
                    message: `${httpRequest.method} method not allowed`
                })
        }
    };

    async function addPGStat(httpRequest) {
        const body = httpRequest.body;
        const { deviceId, slaveId } = httpRequest.queryParams;

        try {
            Object.assign(body, { deviceId, slaveId });
            const payload = await pgsbList.addPGStats(body);

            if (payload) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    message: `PGSB ${deviceId} payload statistics received`
                });
            }
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.CLIENT_ERROR,
                message: error.message
            });
        }
    }

    async function getConsumerPGStats(httpRequest) {
        const { accountNumber } = httpRequest.queryParams;

        try {
            const consumer = await consumerList.findConsumerByAccNumber(accountNumber);

            if (!consumer && !consumer.selected) {
                return objectHandler({
                    code: HttpResponseType.NOT_FOUND,
                    message: `Requested account number '${accountNumber}' is not exists`
                });
            }

            const deviceId = await consumerList.findDeviceIdByAccNumber(accountNumber, 'PGSB');

            if (!deviceId) {
                return objectHandler({
                    code: HttpResponseType.INTERNAL_SERVER_ERROR,
                    message: `PGSB Device Id '${deviceId}' is not exists for account '${accountNumber}'`
                });
            }

            const result = await pgsbList.findAllPGStatsByDeviceId({ deviceId });

            if (result) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: result,
                    message: ''
                });
            } else {
                return objectHandler({
                    code: HttpResponseType.NOT_FOUND,
                    message: `Requested consumer account '${accountNumber}' PG statistics not found`
                });
            }
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.INTERNAL_SERVER_ERROR,
                message: error.message
            });
        }
    }

    async function addPGError(httpRequest) {
        const body = httpRequest.body;
        const { deviceId } = httpRequest.queryParams;

        try {
            Object.assign(body, { deviceId });
            const payload = await pgsbList.addPGError(body);

            if (payload) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: null,
                    message: `PGSB ${deviceId} error log received`
                });
            }
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.CLIENT_ERROR,
                message: error.message
            });
        }
    }
}
