import HttpResponseType from '../enums/http/http-response-type';

import { objectHandler } from '../helpers/utilities/normalize-request';
import customException from '../helpers/utilities/custom-exception';
import defaultRouteHandler from '../helpers/http/default-route-handler';

export default function makeMetaEndPointHandler({ metaList }) {
  async function getServerVersion() {
    try {
      const version = metaList.getServerVersion();

      if (version) {
        return objectHandler({
          status: HttpResponseType.SUCCESS,
          data: { version },
          message: '',
        });
      }
      throw customException(
        'Server version not found',
      );
    } catch (error) {
      return objectHandler({
        code: error.code,
        message: error.message,
      });
    }
  }

  return async function handle(httpRequest) {
    switch (httpRequest.path) {
      case '/version':
        return getServerVersion();
      default:
        return defaultRouteHandler();
    }
  };
}
