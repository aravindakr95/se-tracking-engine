import HttpResponseType from '../models/http-response-type';
import { objectHandler } from '../helpers/utilities/normalize-request';

export default function makeUsersEndpointHandler({
    userList,
}) {
    return async function handle(httpRequest) {
        switch (httpRequest.method) {
        case 'GET':
            return getUsers(httpRequest);
        default:
            return objectHandler({
                code: HttpResponseType.METHOD_NOT_ALLOWED,
                message: `${httpRequest.method} method not allowed`
            });
        }
    };

    async function getUsers(httpRequest) {
        let result = null;
        const { accountNumber } = httpRequest.queryParams;
        if (!accountNumber) {
            try {
                result = await userList.getAllUsers();
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: result,
                    message: ''
                });
            } catch (error) {
                return objectHandler({
                    code: HttpResponseType.INTERNAL_SERVER_ERROR,
                    message: error.message
                });
            }
        } else {
            try {
                result = await userList.findUserByAccNumber({ accountNumber });
                if (result) {
                    return objectHandler({
                        status: HttpResponseType.SUCCESS,
                        data: result,
                        message: ''
                    });
                } else {
                    return objectHandler({
                        code: HttpResponseType.NOT_FOUND,
                        message: `Requested user account '${accountNumber}' not found`
                    });
                }
            } catch (error) {
                return objectHandler({
                    code: HttpResponseType.INTERNAL_SERVER_ERROR,
                    message: error.message
                });
            }
        }
    }
}
