import HttpResponseType from '../models/common/http-response-type';
import { objectHandler } from '../helpers/utilities/normalize-request';

export default function makeUsersEndpointHandler({ userList }) {
    return async function handle(httpRequest) {
        switch (httpRequest.method) {
            case 'GET':
                return httpRequest.queryParams.accountNumber || httpRequest.queryParams.deviceId ?
                    getUser(httpRequest) : getUsers(httpRequest);
            case 'PUT':
                return updateUser(httpRequest);
            case 'DELETE':
                return deleteUser(httpRequest);
            default:
                return objectHandler({
                    code: HttpResponseType.METHOD_NOT_ALLOWED,
                    message: `${httpRequest.method} method not allowed`
                });
        }
    };

    async function getUsers(httpRequest) {
        const status = (httpRequest.queryParams) && (httpRequest.queryParams.status) ?
            httpRequest.queryParams.status : null;
        let result = null;

        if (status) {
            try {
                result = await userList.findUsersByStatus({ status });

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
        }

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
    }

    async function getUser(httpRequest) {
        let result = null;

        if (httpRequest.queryParams.accountNumber) {
            const { accountNumber } = httpRequest.queryParams;

            try {
                result = await userList.findUserByAccNumber(accountNumber);
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

        if (httpRequest.queryParams.deviceId) {
            const { deviceId } = httpRequest.queryParams;

            try {
                result = await userList.findUserByDeviceId(deviceId);
                if (result) {
                    return objectHandler({
                        status: HttpResponseType.SUCCESS,
                        data: result,
                        message: ''
                    });
                } else {
                    return objectHandler({
                        code: HttpResponseType.NOT_FOUND,
                        message: `Requested Device Id '${deviceId}' not found`
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

    async function updateUser(httpRequest) {
        const body = httpRequest.body;
        const { accountNumber } = httpRequest.queryParams;

        try {
            const result = await userList.updateUserByAccNumber({ accountNumber }, body);
            if (result) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: result,
                    message: `User account '${accountNumber}' updated successful`
                });
            } else {
                return objectHandler({
                    code: HttpResponseType.NOT_FOUND,
                    message: `User account '${accountNumber}' is not found`
                });
            }
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.INTERNAL_SERVER_ERROR,
                message: error.message
            });
        }
    }

    async function deleteUser(httpRequest) {
        const { accountNumber } = httpRequest.queryParams;

        let result = await userList.deleteUserByAccNumber({ accountNumber });

        if (result && result.deletedCount) {
            return objectHandler({
                status: HttpResponseType.SUCCESS,
                data: result,
                message: `Account number '${accountNumber}' record is deleted successful`
            });
        } else {
            return objectHandler({
                code: HttpResponseType.NOT_FOUND,
                message: `Requested Account number '${accountNumber}' not found`
            });
        }
    }
}
