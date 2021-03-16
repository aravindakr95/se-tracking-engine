import HttpResponseType from '../enums/http/http-response-type';
import AccountStatus from '../enums/account/account-status';

import { objectHandler } from '../helpers/utilities/normalize-request';
import { getLastDay, getCurrentMonthString } from '../helpers/utilities/date-resolver';
import CustomException from '../helpers/utilities/custom-exception';
import getAvgValues from '../helpers/forecast/forecast-engine';

export default function makeAnalysisEndPointHandler({
  forecastList,
  consumerList,
  analysisList,
}) {
  // execute on 1st day of the month at 06.00 Hours (IST)
  async function generateForecast() {
    try {
      const date = new Date();

      const endDate = getLastDay(date);
      const forecastPeriod = getCurrentMonthString(date);

      const log = await forecastList.findForecastLog({ forecastPeriod });

      if (log && log.isCompleted) {
        throw CustomException(
          `Forecast Reports already generated for '${forecastPeriod}' month`,
          HttpResponseType.CONFLICT,
        );
      }

      const consumers = await consumerList.findConsumersByStatus({ status: AccountStatus.ACTIVE })
        .catch((error) => {
          throw CustomException(error.message);
        });

      if (consumers && consumers.length) {
        for (const consumer of consumers) {
          const { accountNumber } = consumer;

          const reports = await analysisList.findReportsByAccNumber({ accountNumber })
            .catch((error) => {
              throw CustomException(error.message);
            });

          const averageForecast = getAvgValues(reports, endDate);

          Object.assign(averageForecast, { forecastPeriod }, { accountNumber });

          await forecastList.addForecastReport(averageForecast).catch((error) => {
            throw CustomException(error.message);
          });
        }

        const forecastLog = {
          forecastPeriod,
          isCompleted: true,
        };

        const status = await forecastList.addForecastLog(forecastLog).catch((error) => {
          throw CustomException(error.message);
        });

        if (status && status.isCompleted) {
          return objectHandler({
            status: HttpResponseType.SUCCESS,
            message: `Forecast Reports generated for '${forecastPeriod}' is completed`,
          });
        }
      }

      throw CustomException('Consumers collection is empty', HttpResponseType.NOT_FOUND);
    } catch (error) {
      return objectHandler({
        code: error.code,
        message: error.message,
      });
    }
  }

  return async function handle(httpRequest) {
    switch (httpRequest.path) {
      case '/reports/generate':
        return generateForecast();
      default:
        return objectHandler({
          code: HttpResponseType.METHOD_NOT_ALLOWED,
          message: `${httpRequest.method} method not allowed`,
        });
    }
  };
}
