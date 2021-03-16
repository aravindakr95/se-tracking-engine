import HttpResponseType from '../enums/http/http-response-type';

import { objectHandler } from '../helpers/utilities/normalize-request';
import { CustomException } from '../helpers/utilities/custom-exception';

export default function makeMetaEndPointHandler({ metaList }) {
    return async function handle(httpRequest) {
        switch (httpRequest.path) {
        case '/version':
            return getServerVersion();
        default:
            return objectHandler({
                code: HttpResponseType.METHOD_NOT_ALLOWED,
                message: `${httpRequest.method} method not allowed`
            });
        }
    };

    async function getServerVersion() {
        try {
            const version = metaList.getServerVersion();

            if (version) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: { version },
                    message: ''
                });
            } else {
                throw CustomException(
                    'Server version not found'
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
