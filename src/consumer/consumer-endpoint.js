import HttpResponseType from '../enums/http/http-response-type';

import { objectHandler } from '../helpers/utilities/normalize-request';
import hasher from '../helpers/hasher';
import customException from '../helpers/utilities/custom-exception';

export default function makeConsumerEndpointHandler({ consumerList }) {
  async function getConsumers(httpRequest) {
    const status = (httpRequest.queryParams) && (httpRequest.queryParams.status)
      ? httpRequest.queryParams.status : null;

    let result = null;

    if (status) {
      try {
        result = await consumerList.findConsumersByStatus({ status }).catch((error) => {
          throw customException(error.message);
        });

        if (result && result.length) {
          return objectHandler({
            status: HttpResponseType.SUCCESS,
            data: result,
            message: '',
          });
        }
        throw customException(
          'Consumers collection is empty',
          HttpResponseType.NOT_FOUND,
        );
      } catch (error) {
        return objectHandler({
          code: error.code,
          message: error.message,
        });
      }
    }

    try {
      result = await consumerList.getAllConsumers().catch((error) => {
        throw customException(error.message);
      });

      if (result && result.length) {
        return objectHandler({
          status: HttpResponseType.SUCCESS,
          data: result,
          message: '',
        });
      }
      throw customException('Consumers collection is empty', HttpResponseType.NOT_FOUND);
    } catch (error) {
      return objectHandler({
        code: error.code,
        message: error.message,
      });
    }
  }

  async function getConsumer(httpRequest) {
    let result = null;

    if (httpRequest.queryParams.accountNumber) {
      const { accountNumber } = httpRequest.queryParams;

      try {
        result = await consumerList.findConsumerByAccNumber(accountNumber).catch((error) => {
          throw customException(error.message);
        });
        if (result) {
          return objectHandler({
            status: HttpResponseType.SUCCESS,
            data: result,
            message: '',
          });
        }
        throw customException(
          `Requested Consumer account '${accountNumber}' not found`,
          HttpResponseType.NOT_FOUND,
        );
      } catch (error) {
        return objectHandler({
          code: error.code,
          message: error.message,
        });
      }
    }

    if (httpRequest.queryParams.deviceId) {
      const { deviceId } = httpRequest.queryParams;

      try {
        result = await consumerList.findConsumerByDeviceId(deviceId).catch((error) => {
          throw customException(error.message);
        });
        if (result) {
          return objectHandler({
            status: HttpResponseType.SUCCESS,
            data: result,
            message: '',
          });
        }
        throw customException(
          `Requested Device Id '${deviceId}' not associated with any account`,
          HttpResponseType.NOT_FOUND,
        );
      } catch (error) {
        return objectHandler({
          code: error.code,
          message: error.message,
        });
      }
    }
  }

  async function updateConsumer(httpRequest) {
    const { body } = httpRequest;
    const { password } = body;
    const { accountNumber } = httpRequest.queryParams;

    try {
      const passwords = { password: hasher({ password }) };
      const updatedDetails = { ...body, ...passwords };

      const result = await consumerList.updateConsumerByAccNumber(
        { accountNumber },
        updatedDetails,
      ).catch((error) => {
        throw customException(error.message);
      });
      if (result) {
        return objectHandler({
          status: HttpResponseType.SUCCESS,
          data: result,
          message: `Consumer account '${accountNumber}' updated successful`,
        });
      }
      throw customException(
        `Requested consumer account '${accountNumber}' is not found`,
        HttpResponseType.NOT_FOUND,
      );
    } catch (error) {
      return objectHandler({
        code: error.code,
        message: error.message,
      });
    }
  }

  async function deleteConsumer(httpRequest) {
    const { accountNumber } = httpRequest.queryParams;

    try {
      const result = await consumerList.deleteConsumerByAccNumber({ accountNumber })
        .catch((error) => {
          throw customException(error.message);
        });

      if (result && result.deletedCount) {
        return objectHandler({
          status: HttpResponseType.SUCCESS,
          data: result,
          message: `Account number '${accountNumber}' record is deleted successful`,
        });
      }
      throw customException(
        `Requested Consumer account number '${accountNumber}' is not found`,
        HttpResponseType.NOT_FOUND,
      );
    } catch (error) {
      return objectHandler({
        code: error.code,
        message: error.message,
      });
    }
  }

  return async function handle(httpRequest) {
    switch (httpRequest.method) {
      case 'GET':
        return httpRequest.queryParams.accountNumber || httpRequest.queryParams.deviceId
          ? getConsumer(httpRequest) : getConsumers(httpRequest);
      case 'PUT':
        return updateConsumer(httpRequest);
      case 'DELETE':
        return deleteConsumer(httpRequest);
      default:
        return objectHandler({
          code: HttpResponseType.METHOD_NOT_ALLOWED,
          message: `${httpRequest.method} method not allowed`,
        });
    }
  };
}
