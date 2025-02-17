import config from '../config/config';

import HttpResponseType from '../enums/http/http-response-type';
import OperationStatus from '../enums/device/operation-status';
import HouseholdFloor from '../enums/device/household-floor';

import { objectHandler } from '../helpers/utilities/normalize-request';
import distributeStats from '../helpers/distributor/distribute-stats';
import customException from '../helpers/utilities/custom-exception';
import defaultRouteHandler from '../helpers/http/default-route-handler';

export default function makePGSBEndPointHandler({ pgsbList, consumerList }) {
  async function addPGStat(httpRequest) {
    const { body } = httpRequest;
    const { deviceId, slaveId } = httpRequest.queryParams;
    const convertedSlaveId = Number(slaveId);

    let isStored = false;

    try {
      const deviceDetails = {
        deviceId,
        slaveId: convertedSlaveId,
      };

      const pgDetails = { ...body, ...deviceDetails };

      if (convertedSlaveId === HouseholdFloor.FIRST || convertedSlaveId === HouseholdFloor.SECOND) {
        await pgsbList.addPGStats(pgDetails).catch((error) => {
          throw customException(error.message);
        });

        isStored = true;
      }

      if (config.distributor.isAllowed) {
        await distributeStats(pgDetails, OperationStatus.GRID_SUCCESS).catch((error) => {
          throw customException(error.message);
        });
      }

      if (isStored) {
        return objectHandler({
          status: HttpResponseType.SUCCESS,
          message: `PGSB ${deviceId} payload statistics received`,
        });
      }
      return objectHandler({
        status: HttpResponseType.SUCCESS,
        message: `PGSB ${deviceId} payload statistics skipped`,
      });
    } catch (error) {
      return objectHandler({
        code: error.code,
        message: error.message,
      });
    }
  }

  async function getConsumerPGStats(httpRequest) {
    let result = [];

    const { accountNumber, type } = httpRequest.queryParams;
    const uniqueDeviceIds = [];

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

      const deviceIds = await consumerList.findDeviceIdsByAccNumber(accountNumber)
        .catch((error) => {
          throw customException(error.message);
        });

      deviceIds.forEach((deviceId) => {
        if (!uniqueDeviceIds.includes(deviceId)) {
          uniqueDeviceIds.push(deviceId);
        }
      });

      if (!uniqueDeviceIds && !uniqueDeviceIds.length) {
        throw customException(
          `PGSB Device Id '${deviceIds}' is not exists for account '${accountNumber}'`,
          HttpResponseType.NOT_FOUND,
        );
      }

      if (type === 'ALL') {
        result = await pgsbList.findAllPGStatsByDeviceIds(uniqueDeviceIds).catch((error) => {
          throw customException(error.message);
        });
      } else if (type === 'LATEST') {
        result = await pgsbList.findLatestPGStatByDeviceIds(uniqueDeviceIds).catch((error) => {
          throw customException(error.message);
        });
      } else {
        throw customException(
          'Provided parameters are missing or invalid',
          HttpResponseType.NOT_FOUND,
        );
      }

      if (result || (result[0].latest && result[0].latest.length)) {
        return objectHandler({
          status: HttpResponseType.SUCCESS,
          data: result[0].latest,
          message: '',
        });
      }
      throw customException(
        `Requested consumer account '${accountNumber}' PG statistics not found`,
        HttpResponseType.NOT_FOUND,
      );
    } catch (error) {
      return objectHandler({
        code: error.code,
        message: error.message,
      });
    }
  }

  async function addPGError(httpRequest) {
    const { body } = httpRequest;
    const { deviceId } = httpRequest.queryParams;

    try {
      const pgDetails = { ...body, deviceId };
      const payload = await pgsbList.addPGError(pgDetails).catch((error) => {
        throw customException(error.message);
      });

      if (payload) {
        await distributeStats(pgDetails, OperationStatus.GRID_ERROR).catch((error) => {
          throw customException(error.message);
        });

        return objectHandler({
          status: HttpResponseType.SUCCESS,
          message: `PGSB ${deviceId} error log received`,
        });
      }

      return objectHandler({
        status: HttpResponseType.INTERNAL_SERVER_ERROR,
        message: `PGSB ${deviceId} error log add failed`,
      });
    } catch (error) {
      return objectHandler({
        code: HttpResponseType.CLIENT_ERROR,
        message: error,
      });
    }
  }

  return async function handle(httpRequest) {
    switch (httpRequest.path) {
      case '/payloads':
        if (httpRequest.queryParams
                && (httpRequest.queryParams.accountNumber && httpRequest.queryParams.type)) {
          return getConsumerPGStats(httpRequest);
        }

        if (httpRequest.queryParams
                && (httpRequest.queryParams.deviceId && httpRequest.queryParams.slaveId)) {
          return addPGStat(httpRequest);
        }

        return defaultRouteHandler();
      case '/errors':
        return addPGError(httpRequest);
      default:
        return defaultRouteHandler();
    }
  };
}
