import HttpResponseType from '../models/http/http-response-type';
import OperationStatus from '../models/common/operation-status';

import { CustomException } from '../helpers/utilities/custom-exception';
import { objectHandler } from '../helpers/utilities/normalize-request';
import HttpMethod from '../models/http/http-method';
import { fetchInverter } from '../helpers/renac/fetch-pv-data';
import { distributeStats } from '../helpers/distributor/distribute-stats';

export default function makePVSBEndPointHandler({ pvsbList, consumerList }) {
    return async function handle(httpRequest) {
        switch (httpRequest.method) {
        case HttpMethod.GET:
            if (httpRequest.queryParams && httpRequest.queryParams.accountNumber) {
                return getConsumerPVStats(httpRequest);
            }
            return objectHandler({
                code: HttpResponseType.METHOD_NOT_ALLOWED,
                message: `${httpRequest.method} method not allowed`
            });
        case HttpMethod.POST:
            if (httpRequest.queryParams && httpRequest.queryParams.accountNumber) {
                return addPVStat(httpRequest);
            }
            return objectHandler({
                code: HttpResponseType.METHOD_NOT_ALLOWED,
                message: `${httpRequest.method} method not allowed`
            });
        default:
            return objectHandler({
                code: HttpResponseType.METHOD_NOT_ALLOWED,
                message: `${httpRequest.method} method not allowed`
            });
        }
    };

    async function addPVStat(httpRequest) {
        const { accountNumber } = httpRequest.queryParams;

        try {
            const consumer = await consumerList.findConsumerByAccNumber(accountNumber);

            if (!consumer) {
                throw CustomException(
                    'Account is not associated with any available consumers',
                    HttpResponseType.NOT_FOUND
                );
            }

            const pvStats = await fetchInverter().catch(error => {
                throw CustomException(error.message);
            });

            if (!pvStats && !pvStats.data) {
                throw CustomException('PV statistics retrieval failed from the manufacturer server');
            }

            const customPayload = pvsbList.mapPayload(pvStats.data, accountNumber);

            if (!customPayload) {
                throw CustomException(
                    'Custom payload is empty',
                    HttpResponseType.NOT_FOUND
                );
            }

            const result = await pvsbList.addPVStats(customPayload).catch(error => {
                throw CustomException(error.message);
            });

            if (result) {
                await distributeStats(pvStats, OperationStatus.PVSuccess).catch(error => {
                    throw CustomException(error.message);
                });

                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: null,
                    message: `Inverter data for '${result.accountNumber}' payload statistics received`
                });
            }
        } catch (error) {
            return objectHandler({
                code: error.code,
                message: error.message
            });
        }
    }

    async function getConsumerPVStats(httpRequest) {
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

            const result = await pvsbList.findAllPVStatsByAccountNumber({ accountNumber }).catch(error => {
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
                    `Requested consumer account '${accountNumber}' PV statistics not found`,
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
}
