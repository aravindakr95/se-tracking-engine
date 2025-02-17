import config from '../config/config';

import logger from '../config/log-level';

import HttpResponseType from '../enums/http/http-response-type';
import SchemaType from '../enums/account/schema-type';
import AccountStatus from '../enums/account/account-status';

import customException from '../helpers/utilities/custom-exception';
import { objectHandler } from '../helpers/utilities/normalize-request';
import {
  daysInPreviousMonth,
  getCurrentMonthString,
  getPreviousDate,
} from '../helpers/utilities/date-resolver';
import { calculateMonthlyProduction, calculateMonthlyConsumption } from '../helpers/price/throughput-resolver';
import sendEmailPostMark from '../helpers/mail/mailer';
import defaultRouteHandler from '../helpers/http/default-route-handler';

export default function makeAnalysisEndPointHandler({
  analysisList,
  consumerList,
  forecastList,
  summaryList,
}) {
  // execute on 1st day of the month at 03.30 Hours (IST)
  async function generateReports() {
    const dateNow = new Date();

    try {
      const {
        dateInstance,
        dueDate,
        billingPeriod,
        month,
        year,
      } = getPreviousDate();
      const billingDuration = daysInPreviousMonth();

      const log = await analysisList.findReportLog({ billingPeriod });

      if (log && log.isCompleted) {
        throw customException(
          `Monthly reports already generated for '${billingPeriod}'`,
          HttpResponseType.CONFLICT,
        );
      }

      const consumers = await consumerList.findConsumersByStatus({ status: AccountStatus.ACTIVE })
        .catch((error) => {
          throw customException(error.message);
        });

      if (consumers && consumers.length) {
        for (const consumer of consumers) {
          const {
            accountNumber,
            contactNumber,
            email,
            tariff,
            billingCategory,
          } = consumer;

          const pvSummaries = await summaryList.findPVSummariesForMonth(accountNumber, year, month)
            .catch((error) => {
              throw customException(error.message);
            });

          const pgSummaries = await summaryList.findPGSummariesForMonth(accountNumber, year, month)
            .catch((error) => {
              throw customException(error.message);
            });

          if ((!pvSummaries || !pvSummaries.length) || (!pgSummaries || !pgSummaries.length)) {
            logger.error(`PVSB or PGSB summaries not found for the consumer ${accountNumber}`);
            continue;
          }

          const productionDetails = calculateMonthlyProduction(
            pvSummaries,
            billingDuration,
          );

          const consumptionDetails = calculateMonthlyConsumption(
            dateInstance,
            consumer,
            pgSummaries,
            productionDetails,
            billingDuration,
          );

          const forecastPeriod = getCurrentMonthString(dateNow);

          const forecastValues = await forecastList.findForecastReportByAccountNumber(
            accountNumber, forecastPeriod,
          ).catch((error) => {
            throw customException(error.message);
          });

          if (!forecastValues) {
            logger.error(
              `Forecast values not found for the consumer ${accountNumber}`,
            );
            continue;
          }

          const forecastedValues = {
            forecastedPayable: forecastValues.value,
          };

          const commonDetails = {
            accountNumber,
            contactNumber,
            email,
            dueDate,
            billingDuration,
            tariff,
            billingCategory,
            billingPeriod,
            month,
            year,
          };

          const report = {
            ...productionDetails,
            ...consumptionDetails,
            ...forecastedValues,
            ...commonDetails,
          };

          await analysisList.addReport(report).catch((error) => {
            throw customException(error.message);
          });
        }

        const reportLog = {
          billingPeriod,
          isCompleted: true,
        };

        const status = await analysisList.addReportLog(reportLog).catch((error) => {
          throw customException(error.message);
        });

        if (status && status.isCompleted) {
          return objectHandler({
            status: HttpResponseType.SUCCESS,
            message: `Monthly reports generated for '${billingPeriod}' is completed`,
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

  // execute on 1st day of the month at 09.30 Hours (IST)
  async function dispatchReports() {
    try {
      const { billingPeriod } = getPreviousDate();

      const reports = await analysisList.findAllReportsForMonth({ billingPeriod })
        .catch((error) => {
          throw customException(error.message);
        });

      if (!reports || !reports.length) {
        throw customException(
          `Zero reports found for the '${billingPeriod}' period`,
          HttpResponseType.NOT_FOUND,
        );
      }

      for (const report of reports) {
        const { accountNumber } = report;
        // eslint-disable-next-line no-await-in-loop
        const { subscribers } = await consumerList.findConsumerByAccNumber(accountNumber)
          .catch((error) => {
            throw customException(error.message);
          });

        const commonDetails = {
          bodyTitle: `Electricity EBILL for ${billingPeriod}`,
          serverVer: `V${config.version}`,
        };

        const templateReport = { ...report, ...commonDetails };

        for (let i = 0; i < subscribers.length; i++) {
          if (report && report.tariff === SchemaType.NET_METERING) {
            // WARNING: limited resource use with care
            await sendEmailPostMark(templateReport, subscribers, 'monthly-statement-nm', i).catch((error) => {
              throw customException(error.message);
            });
          } else {
            // WARNING: limited resource use with care
            await sendEmailPostMark(templateReport, subscribers, 'monthly-statement-na', i).catch((error) => {
              throw customException(error.message);
            });
          }
        }
      }

      return objectHandler({
        status: HttpResponseType.SUCCESS,
        message: `All consumer reports sent for '${billingPeriod}'`,
      });
    } catch (error) {
      return objectHandler({
        code: error.code,
        message: error.message,
      });
    }
  }

  async function getAllReports() {
    try {
      const result = await analysisList.findAllReports().catch((error) => {
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
        'Reports collection is empty',
        HttpResponseType.NOT_FOUND,
      );
    } catch (error) {
      return objectHandler({
        code: error.code,
        message: error.message,
      });
    }
  }

  async function getAllReportsForAccount(httpRequest) {
    const { accountNumber } = httpRequest.queryParams;

    try {
      const result = await analysisList.findReportsByAccNumber({ accountNumber }).catch((error) => {
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
        `Requested Reports for consumer '${accountNumber}' not found`,
        HttpResponseType.NOT_FOUND,
      );
    } catch (error) {
      return objectHandler({
        code: error.code,
        message: error.message,
      });
    }
  }

  async function getReportsForYear(httpRequest) {
    const { accountNumber, year } = httpRequest.queryParams;

    try {
      const result = await analysisList.findReportsForYear(accountNumber, year).catch((error) => {
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
        `Requested Reports for consumer '${accountNumber}' in '${year}' not found`,
        HttpResponseType.NOT_FOUND,
      );
    } catch (error) {
      return objectHandler({
        code: error.code,
        message: error.message,
      });
    }
  }

  async function getReportForMonth(httpRequest) {
    const { accountNumber, year, month } = httpRequest.queryParams;

    try {
      const result = await analysisList.findReportForMonth(accountNumber, year, month)
        .catch((error) => {
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
        `Requested Reports for consumer '${accountNumber}' in '${year}-${month}' not found`,
        HttpResponseType.NOT_FOUND,
      );
    } catch (error) {
      return objectHandler({
        code: error.code,
        message: error.message,
      });
    }
  }

  async function getReportByInvoiceID(httpRequest) {
    const { _id } = httpRequest.pathParams;

    try {
      const result = await analysisList.findReportByInvoiceID({ _id }).catch((error) => {
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
        `Requested Reports '${_id}' not found`,
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
    switch (httpRequest.path) {
      case '/reports/generate':
        return generateReports();
      case '/reports/dispatch':
        return dispatchReports();
      case '/reports':
        if (httpRequest.queryParams
                && httpRequest.queryParams.accountNumber
                && httpRequest.queryParams.year
                && httpRequest.queryParams.month) {
          return getReportForMonth(httpRequest);
        }

        if (httpRequest.queryParams
                && httpRequest.queryParams.accountNumber
                && httpRequest.queryParams.year) {
          return getReportsForYear(httpRequest);
        }

        if (httpRequest.queryParams
                && httpRequest.queryParams.accountNumber) {
          return getAllReportsForAccount(httpRequest);
        }

        return getAllReports(httpRequest);
      case `/reports/${httpRequest.pathParams.id}`:
        return getReportByInvoiceID(httpRequest);
      default:
        return defaultRouteHandler();
    }
  };
}
