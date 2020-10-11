import HttpResponseType from '../../models/http-response-type';
import * as statusMapper from '../utilities/http-error-status-mapper';

const successResponse = (res, obj) => {
    const headers = { 'Content-Type': 'application/json' };
    const data = {
        status: obj.status,
        message: obj.message,
        data: obj.data || []
    };
    return res
        .set(headers)
        .status(HttpResponseType.SUCCESS)
        .json(data);
};

const errorResponse = (res, obj) => {
    const headers = { 'Content-Type': 'application/json' };
    const data = {
        error: {
            code: statusMapper.httpErrorStatusMapper(obj.code),
            message: obj.message
        }
    };
    return res
        .set(headers)
        .status(obj.code)
        .json(data);
};

module.exports = { successResponse, errorResponse };
