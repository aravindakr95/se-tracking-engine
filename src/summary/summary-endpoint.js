import config from '../config/config';

import HttpResponseType from '../enums/http/http-response-type';
import HttpMethod from '../enums/http/http-method';
import AccountStatus from '../enums/account/account-status';

import { objectHandler } from '../helpers/utilities/normalize-request';
import { getYesterday } from '../helpers/utilities/date-resolver';
import { calculateDailyProduction, calculateDailyConsumption } from '../helpers/price/throughput-resolver';
import customException from '../helpers/utilities/custom-exception';
import sendEmailPostMark from '../helpers/mail/mailer';
import defaultRouteHandler from '../helpers/http/default-route-handler';

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
            summaryDate,
            accountNumber,
            productionToday: calculateDailyProduction(pvsbStats),
            year: dateInstance.getFullYear(),
            month: dateInstance.getMonth() + 1,
            day: dateInstance.getDate(),
          };

          const dailyConsumption = {
            summaryDate,
            accountNumber,
            consumptionToday: calculateDailyConsumption(pgsbStats),
            year: dateInstance.getFullYear(),
            month: dateInstance.getMonth() + 1,
            day: dateInstance.getDate(),
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
      return objectHandler({
        code: error.code,
        message: error.message,
      });
    }
  }

  // execute on next day beginning for the previous day at 00.30 Hours (IST)
  async function dispatchSummaries() {
    try {
      const { summaryDate } = getYesterday();
      const splitDate = summaryDate.split('-');

      const consumers = await consumerList.getAllConsumers().catch((error) => {
        throw customException(error.message);
      });

      for (const consumer of consumers) {
        const {
          email,
          accountNumber,
          tariff,
          billingCategory,
          supplier,
          subscribers,
        } = consumer;
        const { productionToday } = await summaryList.findPVSummariesForDate(
          consumer.accountNumber,
          splitDate[2],
          splitDate[0],
          splitDate[1],
        ).catch((error) => {
          throw customException(error.message);
        });

        const { consumptionToday } = await summaryList.findPGSummariesForDate(
          accountNumber,
          splitDate[2],
          splitDate[0],
          splitDate[1],
        ).catch((error) => {
          throw customException(error.message);
        });

        const commonDetails = {
          bodyTitle: `Electricity Daily Summary Report for ${summaryDate}`,
          serverVer: `V${config.version}`,
        };

        const summaryTemplate = {
          email,
          accountNumber,
          supplier,
          summaryDate,
          productionToday,
          consumptionToday,
          ...commonDetails,
        };

        for (let i = 0; i <= subscribers.length; i++) {
          // WARNING: limited resource use with care
          await sendEmailPostMark(summaryTemplate, consumer.subscribers, 'daily-statement', i).catch((error) => {
            throw customException(error.message);
          });
        }
      }

      return objectHandler({
        status: HttpResponseType.SUCCESS,
        message: `Daily summaries email sending for '${summaryDate}' is completed`,
      });
    } catch (error) {
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

    if (type === 'pv' || type === 'PV') {
      try {
        const result = await summaryList
          .findPVSummariesForMonth(accountNumber, year, month).catch((error) => {
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

    if (type === 'pg' || type === 'PG') {
      try {
        const result = await summaryList
          .findPGSummariesForMonth(accountNumber, year, month).catch((error) => {
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
        if (httpRequest.path === '/generate') {
          return generateSummary();
        }
        if (httpRequest.path === '/dispatch') {
          return dispatchSummaries();
        }
        return defaultRouteHandler();
      case HttpMethod.GET:
        if (httpRequest.queryParams
                && httpRequest.queryParams.type
                && httpRequest.queryParams.accountNumber
                && httpRequest.queryParams.year
                && httpRequest.queryParams.month) {
          return getSummary(httpRequest);
        }

        return defaultRouteHandler();
      default:
        return defaultRouteHandler();
    }
  };
}
