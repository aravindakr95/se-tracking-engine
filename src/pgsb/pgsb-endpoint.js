import HttpResponseType from '../models/http-response-type';

import { objectHandler } from '../helpers/utilities/normalize-request';

export default function makePGSBEndPointHandler({ pgsbList }) {
    return async function handle(httpRequest) {
        switch (httpRequest.path) {
            case '/payloads':
                return addPGStat(httpRequest);
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

        try {
            const payload = await pgsbList.addPGStats(body);

            if (payload) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: null,
                    message: `PGSB ${result.deviceId} payload statistics received`
                });
            }
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.CLIENT_ERROR,
                message: error.message
            });
        }
    }

    async function addPGError(httpRequest) {
        const body = httpRequest.body;

        try {
            const payload = await pgsbList.addPGErrors(body);

            if (payload) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: null,
                    message: `PGSB ${result.deviceId} error log received`
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
