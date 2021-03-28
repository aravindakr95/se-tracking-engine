import config from '../config/config';

import HttpResponseType from '../enums/http/http-response-type';
import OperationStatus from '../enums/device/operation-status';
import HttpMethod from '../enums/http/http-method';

import { objectHandler } from '../helpers/utilities/normalize-request';
import customException from '../helpers/utilities/custom-exception';
import fetchInverter from '../helpers/renac/fetch-pv-data';
import distributeStats from '../helpers/distributor/distribute-stats';
import defaultRouteHandler from '../helpers/http/default-route-handler';

export default function makePVSBEndPointHandler({ pvsbList, consumerList }) {
  async function addPVStat(httpRequest) {
    const { accountNumber } = httpRequest.queryParams;

    try {
      const consumer = await consumerList.findConsumerByAccNumber(accountNumber);

      if (!consumer) {
        throw customException(
          'Account is not associated with any available consumers',
          HttpResponseType.NOT_FOUND,
        );
      }

      const pvStats = await fetchInverter().catch((error) => {
        throw customException(error.message);
      });

      const { data } = pvStats;

      if (!pvStats && !data) {
        throw customException('PV statistics retrieval failed from the manufacturer server');
      }

      const customPayload = pvsbList.mapPayload(data, accountNumber);

      if (!customPayload) {
        throw customException(
          'Custom payload is empty',
          HttpResponseType.NOT_FOUND,
        );
      }

      if (customPayload && !customPayload.totalEnergy) {
        // Send success response or device will restarts if error occurs recursively
        return objectHandler({
          status: HttpResponseType.SUCCESS,
          data: null,
          message: `Inverter data for '${accountNumber}' payload statistics ignored because body is not valid`,
        });
      }

      const result = await pvsbList.addPVStats(customPayload).catch((error) => {
        throw customException(error.message);
      });

      if (result && config.distributor.isAllowed) {
        await distributeStats(data, OperationStatus.PV_SUCCESS).catch((error) => {
          throw customException(error.message);
        });
      }

      return objectHandler({
        status: HttpResponseType.SUCCESS,
        data: null,
        message: `Inverter data for '${result.accountNumber}' payload statistics received`,
      });
    } catch (error) {
      return objectHandler({
        code: error.code,
        message: error.message,
      });
    }
  }

  async function getConsumerPVStats(httpRequest) {
    const { accountNumber, type } = httpRequest.queryParams;
    let result = null;

    try {
      const consumer = await consumerList.findConsumerByAccNumber(accountNumber).catch((error) => {
        throw customException(error.message);
      });

      if (!consumer) {
        throw customException(
          `Requested account number '${accountNumber}' is not exists`,
          HttpResponseType.NOT_FOUND,
        );
      }

      if (type === 'ALL') {
        result = await pvsbList.findAllPVStatsByAccountNumber({ accountNumber }).catch((error) => {
          throw customException(error.message);
        });
      } else if (type === 'LATEST') {
        result = await pvsbList.findLatestPVStatByAccountNumber({ accountNumber })
          .catch((error) => {
            throw customException(error.message);
          });
      } else {
        throw customException(
          'Provided parameters are missing or invalid',
          HttpResponseType.NOT_FOUND,
        );
      }

      if (result && result.length) {
        return objectHandler({
          status: HttpResponseType.SUCCESS,
          data: result,
          message: '',
        });
      }
      throw customException(
        `Requested consumer account '${accountNumber}' PV statistics not found`,
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
      case HttpMethod.GET:
        if (httpRequest.queryParams
                && (httpRequest.queryParams.accountNumber && httpRequest.queryParams.type)) {
          return getConsumerPVStats(httpRequest);
        }

        return defaultRouteHandler();
      case HttpMethod.POST:
        if (httpRequest.queryParams && httpRequest.queryParams.accountNumber) {
          return addPVStat(httpRequest);
        }

        return defaultRouteHandler();
      default:
        return defaultRouteHandler();
    }
  };
}
