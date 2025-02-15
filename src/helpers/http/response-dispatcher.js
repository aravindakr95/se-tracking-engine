import HttpResponseType from '../../enums/http/http-response-type';

import httpErrorStatusMapper from './http-error-status-mapper';

const successResponse = (res, obj) => {
  const headers = { 'Content-Type': 'application/json' };
  const data = {
    status: obj.status,
    message: obj.message,
    data: obj.data || null,
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
      code: httpErrorStatusMapper(obj.code),
      message: obj.message,
    },
  };
  return res
    .set(headers)
    .status(obj.code)
    .json(data);
};

export { successResponse, errorResponse };
