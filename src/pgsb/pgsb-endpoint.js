import HttpResponseType from '../models/http/http-response-type';
import OperationStatus from '../models/common/operation-status';

import { CustomException } from '../helpers/utilities/custom-exception';
import { objectHandler } from '../helpers/utilities/normalize-request';
import { distributeStats } from '../helpers/distributor/distribute-stats';

export default function makePGSBEndPointHandler({ pgsbList, consumerList }) {
    return async function handle(httpRequest) {
        switch (httpRequest.path) {
        case '/payloads':
            if (httpRequest.queryParams &&
            (httpRequest.queryParams.accountNumber && httpRequest.queryParams.type)) {
                return getConsumerPGStats(httpRequest);
            }

            if (httpRequest.queryParams &&
                (httpRequest.queryParams.deviceId && httpRequest.queryParams.slaveId)) {
                return addPGStat(httpRequest);
            }

            return objectHandler({
                code: HttpResponseType.METHOD_NOT_ALLOWED,
                message: `${httpRequest.method} method not allowed`
            });
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
                await distributeStats(body, OperationStatus.GridSuccess).catch(error => {
                    throw CustomException(error.message);
                });

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
        const { accountNumber, type } = httpRequest.queryParams;
        let result = [];
        let uniqueDeviceIds = [];

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

            const deviceIds = await consumerList.findDeviceIdsByAccNumber(accountNumber)
                .catch(error => {
                    throw CustomException(error.message);
                });

            deviceIds.forEach((deviceId) => {
                if (!uniqueDeviceIds.includes(deviceId)) {
                    uniqueDeviceIds.push(deviceId);
                }
            });

            if (!uniqueDeviceIds && !uniqueDeviceIds.length) {
                throw CustomException(
                    `PGSB Device Id '${deviceIds}' is not exists for account '${accountNumber}'`,
                    HttpResponseType.NOT_FOUND
                );
            }

            if (type === 'ALL') {
                result = await pgsbList.findAllPGStatsByDeviceIds(uniqueDeviceIds).catch(error => {
                    throw CustomException(error.message);
                });
            } else if (type === 'LATEST') {
                result = await pgsbList.findLatestPGStatByDeviceIds(uniqueDeviceIds).catch(error => {
                    throw CustomException(error.message);
                });
            } else {
                throw CustomException(
                    'Provided parameters are missing or invalid',
                    HttpResponseType.NOT_FOUND
                );
            }

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
                await distributeStats(body, OperationStatus.GridError).catch(error => {
                    throw CustomException(error.message);
                });

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
