import config from '../config/config';

import HttpResponseType from '../models/http/http-response-type';
import AccountStatus from '../models/common/account-status';

import { CustomException } from '../helpers/utilities/custom-exception';
import { objectHandler } from '../helpers/utilities/normalize-request';
import {
    daysInPreviousMonth,
    getCurrentMonthString,
    getPreviousDate,
    getPreviousMonthStartEndDate
} from '../helpers/utilities/date-resolver';
import { calculateMonthlyProduction, calculateMonthlyConsumption } from '../helpers/price/throughput-resolver';
import { sendEmailPostMark } from '../helpers/mail/mailer';

export default function makeAnalysisEndPointHandler({
    analysisList,
    consumerList,
    pvsbList,
    pgsbList,
    forecastList
}) {
    return async function handle(httpRequest) {
        switch (httpRequest.path) {
        case '/reports/generate':
            return generateReports();
        case '/reports/dispatch':
            return dispatchReports();
        case '/reports':
            if (httpRequest.queryParams &&
                httpRequest.queryParams.accountNumber &&
                httpRequest.queryParams.year &&
                httpRequest.queryParams.month) {
                return getReportForMonth(httpRequest);
            }

            if (httpRequest.queryParams &&
                httpRequest.queryParams.accountNumber &&
                httpRequest.queryParams.year) {
                return getReportsForYear(httpRequest);
            }

            if (httpRequest.queryParams &&
                httpRequest.queryParams.accountNumber) {
                return getAllReportsForAccount(httpRequest);
            }

            return getAllReports(httpRequest);
        case `/reports/${httpRequest.pathParams._id}`:
            return getReportByInvoiceID(httpRequest);
        default:
            return objectHandler({
                code: HttpResponseType.METHOD_NOT_ALLOWED,
                message: `${httpRequest.method} method not allowed`
            });
        }
    };

    // execute on 1st day of the month at 09.00 Hours (IST)
    async function generateReports() {
        const dateNow = new Date();

        try {
            const { dateInstance, billingPeriod, month, year } = getPreviousDate();
            const billingDuration = daysInPreviousMonth();
            const { startTime, endTime } = getPreviousMonthStartEndDate();

            const log = await analysisList.findReportLog({ billingPeriod });

            if (log && log.isCompleted) {
                throw CustomException(
                    `Monthly reports already generated for '${billingPeriod}'`,
                    HttpResponseType.CONFLICT
                );
            }

            const consumers = await consumerList.findConsumersByStatus({ status: AccountStatus.ACTIVE })
                .catch(error => {
                    throw CustomException(error.message);
                });

            if (consumers && consumers.length) {
                for (const consumer of consumers) {
                    let uniqueDeviceIds = [];

                    let {
                        accountNumber,
                        contactNumber,
                        email,
                        tariff,
                        billingCategory
                    } = consumer;

                    const pgsbDeviceIds = await consumerList.findDeviceIdsByAccNumber(accountNumber)
                        .catch(error => {
                            throw CustomException(error.message);
                        });

                    pgsbDeviceIds.forEach((deviceId) => {
                        if (!uniqueDeviceIds.includes(deviceId)) {
                            uniqueDeviceIds.push(deviceId);
                        }
                    });

                    const pgsbStats = await pgsbList.findLatestOldestPGStatsByDeviceIds(uniqueDeviceIds, startTime, endTime)
                        .catch(error => {
                            throw CustomException(error.message);
                        });

                    const pvsbStats = await pvsbList.findLatestOldestPVStatByTime(accountNumber, startTime, endTime)
                        .catch(error => {
                            throw CustomException(error.message);
                        });

                    if (!(pvsbStats) || !(pgsbStats && pgsbStats.length)) {
                        continue;
                    }

                    const productionDetails = calculateMonthlyProduction(
                        pvsbStats,
                        billingDuration);

                    const consumptionDetails = calculateMonthlyConsumption(
                        dateInstance,
                        consumer,
                        pgsbStats,
                        productionDetails,
                        billingDuration);

                    const forecastPeriod = getCurrentMonthString(dateNow);

                    const forecastValues = await forecastList.findForecastReportByAccountNumber(
                        accountNumber, forecastPeriod
                    ).catch(error => {
                        throw CustomException(error.message);
                    });

                    const forecastedValues = {
                        forecastedPayable: forecastValues.value || 0
                    };

                    const commonDetails = {
                        accountNumber,
                        contactNumber,
                        email,
                        billingDuration,
                        tariff,
                        billingCategory,
                        billingPeriod,
                        month,
                        year
                    };

                    const report = Object.assign({},
                        productionDetails,
                        consumptionDetails,
                        forecastedValues,
                        commonDetails
                    );

                    await analysisList.addReport(report).catch(error => {
                        throw CustomException(error.message);
                    });
                }

                const reportLog = {
                    billingPeriod,
                    isCompleted: true
                };

                const status = await analysisList.addReportLog(reportLog).catch(error => {
                    throw CustomException(error.message);
                });

                if (status && status.isCompleted) {
                    // const lastDayMS = dateInstance.getTime();

                    // await pgsbList.flushPGData(lastDayMS).catch(error => {
                    //     throw CustomException(error.message);
                    // });
                    //
                    // await pgsbList.flushPGErrorData(lastDayMS).catch(error => {
                    //     throw CustomException(error.message);
                    // });
                    //
                    // await pvsbList.flushPVData(lastDayMS).catch(error => {
                    //     throw CustomException(error.message);
                    // });

                    return objectHandler({
                        status: HttpResponseType.SUCCESS,
                        message: `Monthly reports generated for '${billingPeriod}' is completed`
                    });
                }
            } else {
                throw CustomException('Consumers collection is empty', HttpResponseType.NOT_FOUND);
            }
        } catch (error) {
            return objectHandler({
                code: error.code,
                message: error.message
            });
        }
    }

    // execute on 1st day of the month at 15.00 Hours (IST)
    async function dispatchReports() {
        try {
            const { billingPeriod } = getPreviousDate();

            const reports = await analysisList.findAllReportsForMonth({ billingPeriod })
                .catch(error => {
                    throw CustomException(error.message);
                });

            if (reports && !reports.length) {
                throw CustomException(
                    `Zero reports found for the '${billingPeriod}' period`,
                    HttpResponseType.NOT_FOUND
                );
            }

            for (const report of reports) {
                const { accountNumber } = report;
                const { subscribers } = await consumerList.findConsumerByAccNumber(accountNumber)
                    .catch(error => {
                        throw CustomException(error.message);
                    });

                const templateReport = Object.assign(report, {
                    bodyTitle: `Electricity EBILL for ${billingPeriod}`,
                    currency: config.currency,
                    supplier: config.supplier
                });

                for (let i = 0; i <= subscribers.length; i++) {
                    if (report && report.tariff === 'Net Metering') {
                        //WARNING: limited resource use with care
                        await sendEmailPostMark(templateReport, subscribers, 'monthly-statement-nm', i).catch(error => {
                            throw CustomException(error.message);
                        });
                    } else {
                        //WARNING: limited resource use with care
                        await sendEmailPostMark(templateReport, subscribers, 'monthly-statement-na', i).catch(error => {
                            throw CustomException(error.message);
                        });
                    }
                }
            }

            return objectHandler({
                status: HttpResponseType.SUCCESS,
                message: `All consumer reports sent for '${billingPeriod}'`
            });
        } catch (error) {
            return objectHandler({
                code: error.code,
                message: error.message
            });
        }
    }

    async function getAllReports() {
        try {
            const result = await analysisList.findAllReports().catch(error => {
                throw CustomException(error.message);
            });

            if (result && result.length) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: result,
                    message: ''
                });
            } else {
                throw CustomException(
                    'Reports collection is empty',
                    HttpResponseType.NOT_FOUND
                );
            }
        } catch (error) {
            return objectHandler({
                code: error.code,
                message: error.message
            });
        }
    }

    async function getAllReportsForAccount(httpRequest) {
        const { accountNumber } = httpRequest.queryParams;

        try {
            const result = await analysisList.findReportsByAccNumber({ accountNumber }).catch(error => {
                throw CustomException(error.message);
            });

            if (result && result.length) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: result,
                    message: ''
                });
            } else {
                throw CustomException(
                    `Requested Reports for consumer '${accountNumber}' not found`,
                    HttpResponseType.NOT_FOUND
                );
            }
        } catch (error) {
            return objectHandler({
                code: error.code,
                message: error.message
            });
        }
    }

    async function getReportsForYear(httpRequest) {
        const { accountNumber, year } = httpRequest.queryParams;

        try {
            const result = await analysisList.findReportsForYear(accountNumber, year).catch(error => {
                throw CustomException(error.message);
            });

            if (result && result.length) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: result,
                    message: ''
                });
            } else {
                throw CustomException(
                    `Requested Reports for consumer '${accountNumber}' in '${year}' not found`,
                    HttpResponseType.NOT_FOUND
                );
            }
        } catch (error) {
            return objectHandler({
                code: error.code,
                message: error.message
            });
        }
    }

    async function getReportForMonth(httpRequest) {
        const { accountNumber, year, month } = httpRequest.queryParams;

        try {
            const result = await analysisList.findReportForMonth(accountNumber, year, month).catch(error => {
                throw CustomException(error.message);
            });

            if (result) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: result,
                    message: ''
                });
            } else {
                throw CustomException(
                    `Requested Reports for consumer '${accountNumber}' in '${year}-${month}' not found`,
                    HttpResponseType.NOT_FOUND
                );
            }
        } catch (error) {
            return objectHandler({
                code: error.code,
                message: error.message
            });
        }
    }

    async function getReportByInvoiceID(httpRequest) {
        const { _id } = httpRequest.pathParams;

        try {
            const result = await analysisList.findReportByInvoiceID({ _id }).catch(error => {
                throw CustomException(error.message);
            });

            if (result) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: result,
                    message: ''
                });
            } else {
                throw CustomException(
                    `Requested Reports '${_id}' not found`,
                    HttpResponseType.NOT_FOUND
                );
            }
        } catch (error) {
            return objectHandler({
                code: error.code,
                message: error.message
            });
        }
    }
}
