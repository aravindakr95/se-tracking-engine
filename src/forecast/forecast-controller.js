import handleForecastRequest from './index';

import HttpResponseType from '../enums/http/http-response-type';

import { normalizeRequest } from '../helpers/utilities/normalize-request';

import { successResponse, errorResponse } from '../helpers/http/response-dispatcher';

export default function forecastController(req, res) {
  const httpRequest = normalizeRequest(req);

  handleForecastRequest(httpRequest)
    .then(({ data }) => {
      if (data.status) {
        return successResponse(res, data);
      }
      return errorResponse(res, data);
    })
    .catch((error) => {
      errorResponse(res, {
        code: HttpResponseType.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    });
}
