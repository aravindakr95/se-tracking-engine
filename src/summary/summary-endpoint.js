import HttpResponseType from '../enums/http/http-response-type';
import HttpMethod from '../enums/http/http-method';
import AccountStatus from '../enums/account/account-status';

import { objectHandler } from '../helpers/utilities/normalize-request';
import { getYesterday } from '../helpers/utilities/date-resolver';
import { calculateDailyProduction, calculateDailyConsumption } from '../helpers/price/throughput-resolver';
import customException from '../helpers/utilities/custom-exception';

export default function makeSummaryEndPointHandler({
  summaryList, consumerList, pvsbList, pgsbList,
}) {
  // execute on next day beginning for the previous day at 00.05 Hours (IST)
  async function generateSummary() {
    const {
      startTime, endTime, summaryDate, dateInstance,
    } = getYesterday();

    try {
      const log = await summaryList.findSummaryLog({ summaryDate });

      if (log && log.isCompleted) {
        throw customException(
          `Daily summary already generated for '${summaryDate}'`,
          HttpResponseType.CONFLICT,
        );
      }

      const consumers = await consumerList.findConsumersByStatus({ status: AccountStatus.ACTIVE })
        .catch((error) => {
          throw customException(error.message);
        });

      if (consumers && consumers.length) {
        for (const consumer of consumers) {
          const uniqueDeviceIds = [];
          const { accountNumber } = consumer;

          const pgsbDeviceIds = await consumerList.findDeviceIdsByAccNumber(accountNumber)
            .catch((error) => {
              throw customException(error.message);
            });

          pgsbDeviceIds.forEach((deviceId) => {
            if (!uniqueDeviceIds.includes(deviceId)) {
              uniqueDeviceIds.push(deviceId);
            }
          });

          const pgsbStats = await pgsbList
            .findLatestOldestPGStatsByDeviceIds(uniqueDeviceIds, startTime, endTime)
            .catch((error) => {
              throw customException(error.message);
            });

          const pvsbStats = await pvsbList
            .findLatestOldestPVStatByTime(accountNumber, startTime, endTime)
            .catch((error) => {
              throw customException(error.message);
            });

          if (!(pvsbStats) || !(pgsbStats && pgsbStats.length)) {
            continue;
          }

          const dailyProduction = {
            year: dateInstance.getFullYear(),
            month: dateInstance.getMonth() + 1,
            day: dateInstance.getDate(),
            summaryDate,
            accountNumber,
            productionToday: calculateDailyProduction(pvsbStats),
          };

          const dailyConsumption = {
            year: dateInstance.getFullYear(),
            month: dateInstance.getMonth() + 1,
            day: dateInstance.getDate(),
            summaryDate,
            accountNumber,
            consumptionToday: calculateDailyConsumption(pgsbStats),
          };

          await summaryList.addPVSummary(dailyProduction).catch((error) => {
            throw customException(error.message);
          });

          await summaryList.addPGSummary(dailyConsumption).catch((error) => {
            throw customException(error.message);
          });
        }

        const summaryLog = {
          summaryDate,
          isCompleted: true,
        };

        const status = await summaryList.addSummaryLog(summaryLog).catch((error) => {
          throw customException(error.message);
        });

        if (status && status.isCompleted) {
          await pgsbList.flushPGData(startTime, endTime).catch((error) => {
            throw customException(error.message);
          });

          await pvsbList.flushPVData(startTime, endTime).catch((error) => {
            throw customException(error.message);
          });

          return objectHandler({
            status: HttpResponseType.SUCCESS,
            message: `Daily summary reports generated for '${summaryDate}' is completed`,
          });
        }
      } else {
        throw customException('Consumers collection is empty', HttpResponseType.NOT_FOUND);
      }
    } catch (error) {
      console.log(error);
      return objectHandler({
        code: error.code,
        message: error.message,
      });
    }
  }

  async function getSummary(httpRequest) {
    const {
      type, accountNumber, year, month,
    } = httpRequest.queryParams;

    if (type === 'pv') {
      try {
        const result = await summaryList
          .findPVSummary(accountNumber, year, month).catch((error) => {
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
          'Requested daily reports not found',
          HttpResponseType.NOT_FOUND,
        );
      } catch (error) {
        return objectHandler({
          code: error.code,
          message: error.message,
        });
      }
    }

    if (type === 'pg') {
      try {
        const result = await summaryList
          .findPGSummary(accountNumber, year, month).catch((error) => {
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
          'Requested daily reports not found',
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

  return async function handle(httpRequest) {
    switch (httpRequest.method) {
      case HttpMethod.POST:
        return generateSummary();
      case HttpMethod.GET:
        if (httpRequest.queryParams
                && httpRequest.queryParams.type
                && httpRequest.queryParams.accountNumber
                && httpRequest.queryParams.year
                && httpRequest.queryParams.month) {
          return getSummary(httpRequest);
        }
        return objectHandler({
          code: HttpResponseType.METHOD_NOT_ALLOWED,
          message: `${httpRequest.method} method not allowed`,
        });
      default:
        return objectHandler({
          code: HttpResponseType.METHOD_NOT_ALLOWED,
          message: `${httpRequest.method} method not allowed`,
        });
    }
  };
}
