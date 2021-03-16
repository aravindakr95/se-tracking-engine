import handleConsumerRequest from './index';

import HttpResponseType from '../enums/http/http-response-type';

import { normalizeRequest } from '../helpers/utilities/normalize-request';
import { successResponse, errorResponse } from '../helpers/response/response-dispatcher';

export default function consumerController(req, res) {
  const httpRequest = normalizeRequest(req);

  handleConsumerRequest(httpRequest)
    .then(({
      data,
    }) => {
      if (data.status) {
        successResponse(res, data);
      } else {
        errorResponse(res, data);
      }
    })
    .catch((error) => {
      errorResponse(res, {
        code: HttpResponseType.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    });
}
