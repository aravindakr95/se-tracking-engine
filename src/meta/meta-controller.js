import handleMetaRequest from './index';
import HttpResponseType from '../enums/http/http-response-type';

import { normalizeRequest } from '../helpers/utilities/normalize-request';
import { successResponse, errorResponse } from '../helpers/http/response-dispatcher';

export default function metaController(req, res) {
  const httpRequest = normalizeRequest(req);

  handleMetaRequest(httpRequest)
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
