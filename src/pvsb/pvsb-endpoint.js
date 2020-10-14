import HttpResponseType from '../models/http-response-type';

import { objectHandler } from '../helpers/utilities/normalize-request';

export default function makePVSBEndPointHandler({ pvsbList }) {
    return async function handle(httpRequest) {
        switch (httpRequest.path) {
            case '/payloads':
                return addPVStat(httpRequest);
            case '/errors':
                return addPVError(httpRequest)
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
            console.log(error.message)
            return objectHandler({
                code: HttpResponseType.CLIENT_ERROR,
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

            console.log(payload);

            if (payload) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: null,
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
