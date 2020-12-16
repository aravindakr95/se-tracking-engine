import { errorResponse } from '../helpers/response/response-dispatcher';
import HttpResponseType from '../models/http/http-response-type';
import config from '../config/config';

export default function authenticateToGenerate(req, res, next) {
    const adminHeader = req.headers['admin-token'];

    if (!adminHeader) {
        return errorResponse(res, {
            code: HttpResponseType.AUTH_REQUIRED,
            message: 'Admin token is not presented'
        });
    }

    if (adminHeader === config.adminToken) {
        next();
    } else {
        return errorResponse(res, {
            code: HttpResponseType.AUTH_REQUIRED,
            message: 'Unauthorized to access this resource'
        });
    }
}
