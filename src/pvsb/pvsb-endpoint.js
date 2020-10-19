import HttpResponseType from '../models/common/http-response-type';

import { objectHandler } from '../helpers/utilities/normalize-request';

export default function makePVSBEndPointHandler({ pvsbList, userList }) {
    return async function handle(httpRequest) {
        switch (httpRequest.path) {
            case '/payloads':
                return httpRequest.queryParams && httpRequest.queryParams.accountNumber ? getUserPVStats(httpRequest) :
                    addPVStat(httpRequest);
            case '/errors':
                return addPVError(httpRequest);
            default:
                return objectHandler({
                    code: HttpResponseType.METHOD_NOT_ALLOWED,
                    message: `${httpRequest.method} method not allowed`
                })
        }
    };

    async function addPVStat(httpRequest) {
        const body = httpRequest.body;
        const { deviceId } = httpRequest.queryParams;

        try {
            const customPayload = pvsbList.mapPayload(deviceId, body);

            if (!customPayload) {
                console.log('Custom payload is empty');
                return;
            }

            const result = await pvsbList.addPVStats(customPayload);

            return objectHandler({
                status: HttpResponseType.SUCCESS,
                data: null,
                message: `PVSB '${result.deviceId}' payload statistics received`
            });

        } catch (error) {
            return objectHandler({
                code: HttpResponseType.CLIENT_ERROR,
                message: error.message
            });
        }
    }

    async function getUserPVStats(httpRequest) {
        const { accountNumber } = httpRequest.queryParams;

        try {
            const user = await userList.findUserByAccNumber(accountNumber);

            if (!user && !user.selected) {
                return objectHandler({
                    code: HttpResponseType.NOT_FOUND,
                    message: `Requested account number '${accountNumber}' is not exists`
                });
            }

            const deviceId = await userList.findDeviceIdByAccNumber(accountNumber, 'PVSB');

            if (!deviceId) {
                return objectHandler({
                    code: HttpResponseType.INTERNAL_SERVER_ERROR,
                    message: `PVSB Device Id '${accountNumber}' is not exists for account '${accountNumber}'`
                });
            }

            const result = await pvsbList.findAllPVStatsByDeviceId({ deviceId });

            if (result) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: result,
                    message: ''
                });
            } else {
                return objectHandler({
                    code: HttpResponseType.NOT_FOUND,
                    message: `Requested user account '${accountNumber}' PV statistics not found`
                });
            }
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.INTERNAL_SERVER_ERROR,
                message: error.message
            });
        }
    }

    async function addPVError(httpRequest) {
        const body = httpRequest.body;
        const { deviceId } = httpRequest.queryParams;

        try {
            Object.assign(body, { deviceId });
            const payload = await pvsbList.addPVError(body);

            if (payload) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    message: `PVSB '${result.deviceId}' error log received`
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
