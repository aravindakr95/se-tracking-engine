import handleUserRequest from './';
import normalizedRequest from '../helpers/utilities/normalize-request';
import HttpResponseType from '../models/http-response-type';
import { successResponse, errorResponse } from '../helpers/response/response-dispatcher';

export default function usersController(req, res) {
    const httpRequest = normalizedRequest(req);

    handleUserRequest(httpRequest)
        .then(({
            data
        }) => {
            if (data.status) {
                successResponse(res, data);
            } else {
                errorResponse(res, data);
            }
        }
        )
        .catch((error) => {
            errorResponse(res, {
                code: HttpResponseType.INTERNAL_SERVER_ERROR,
                message: error.message
            });
        });
}
