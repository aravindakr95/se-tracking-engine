import HttpResponseType from '../models/common/http-response-type';
import { objectHandler } from '../helpers/utilities/normalize-request';
import { daysInPreviousMonth, dateComparePG, dateComparePV, getPreviousDate } from '../helpers/utilities/date-resolver';
import { calculateProduction, calculateConsumption } from '../helpers/utilities/throughput-resolver';
import { configSMS, sendSMS } from '../helpers/sms/messenger';
import { sendEmailPostMark } from '../helpers/mail/mailer';
import config from '../config/config';
import { getInvoiceSMSTemplate } from '../helpers/templates/sms/sms-broker';

export default function makeAnalysisEndPointHandler({ analysisList, consumerList, pvsbList, pgsbList }) {
    return async function handle(httpRequest) {
        switch (httpRequest.path) {
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
        case '/reports/generate':
            return generateReports();
        case '/reports/dispatch':
            return dispatchReports();
        default:
            return objectHandler({
                code: HttpResponseType.METHOD_NOT_ALLOWED,
                message: `${httpRequest.method} method not allowed`
            });
        }
    };

    // execute on 1st day of the month at 06.00 Hours
    async function generateReports() {
        try {
            const { dateInstance, billingPeriod, month, year } = getPreviousDate();
            const billingDuration = daysInPreviousMonth();

            const log = await analysisList.findReportLog({ billingPeriod });

            if (log && log.isCompleted) {
                return objectHandler({
                    code: HttpResponseType.CONFLICT,
                    message: `Reports already generated for '${billingPeriod}' previous month`
                });
            }

            const response = await consumerList.getAllConsumers();

            if (response && response.length) {
                for (const consumer of response) {
                    let {
                        accountNumber,
                        contactNumber,
                        email,
                        tariff,
                        billingCategory
                    } = consumer;

                    const pgsbDeviceId = await consumerList.findDeviceIdByAccNumber(accountNumber, 'PGSB');
                    const pgsbStats = await pgsbList.findAllPGStatsByDeviceId({ deviceId: pgsbDeviceId });

                    const pvsbDeviceId = await consumerList.findDeviceIdByAccNumber(accountNumber, 'PVSB');
                    const pvsbStats = await pvsbList.findAllPVStatsByDeviceId({ deviceId: pvsbDeviceId });

                    const sortedPVSBStats = getCurrentMonthStats('PVSB', pvsbStats);
                    const sortedPGSBStats = getCurrentMonthStats('PGSB', pgsbStats);

                    const energyToday = pvsbStats.map(stat => stat.energyToday);

                    const productionDetails = calculateProduction(
                        sortedPVSBStats,
                        energyToday,
                        energyToday.length);

                    const consumptionDetails = calculateConsumption(
                        dateInstance,
                        consumer,
                        sortedPGSBStats,
                        productionDetails,
                        billingDuration);

                    const forecastedValues = {
                        forecastedPayable: 0.00 //todo: create a way to predict the total amount for next month
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

                    await analysisList.addReport(report);
                }

                const reportLog = {
                    billingPeriod,
                    isCompleted: true
                };

                const status = await analysisList.addReportLog(reportLog);

                if (status && status.isCompleted) {
                    return objectHandler({
                        status: HttpResponseType.SUCCESS,
                        message: `Reports generated for '${billingPeriod}' is completed`
                    });
                }
            }

            return objectHandler({
                code: HttpResponseType.NOT_FOUND,
                message: 'Consumers collection is empty'
            });
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.INTERNAL_SERVER_ERROR,
                message: error.message
            });
        }
    }

    // execute on 1st day of the month at 12.00 Hours
    async function dispatchReports() {
        try {
            const smsOptions = {
                url: config.notifier.IBSMSOut,
                method: 'post'
            };

            const { billingPeriod } = getPreviousDate();

            const reports = await analysisList.findAllReportsForMonth({ billingPeriod  });

            if (reports && !reports.length) {
                return objectHandler({
                    code: HttpResponseType.NOT_FOUND,
                    message: `Zero reports found for the '${billingPeriod}' period`
                });
            }

            for (const report of reports) {
                const smsTemplate = getInvoiceSMSTemplate(report);

                const sms = configSMS(report.contactNumber, smsTemplate);

                //WARNING: limited resource use with care
                await sendSMS(smsOptions, sms).catch(error => {
                    return objectHandler({
                        code: HttpResponseType.INTERNAL_SERVER_ERROR,
                        message: error.message
                    });
                });

                const templateReport = Object.assign(report, {
                    bodyTitle: `Electricity EBILL for ${billingPeriod}`,
                    currency: config.currency,
                    supplier: config.supplier
                });

                //WARNING: limited resource use with care
                await sendEmailPostMark(templateReport, 'monthly-statement').catch(error => {
                    return objectHandler({
                        code: HttpResponseType.INTERNAL_SERVER_ERROR,
                        message: error.message
                    });
                });
            }

            return objectHandler({
                status: HttpResponseType.SUCCESS,
                message: `All consumer reports sent for '${billingPeriod}'`
            });
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.INTERNAL_SERVER_ERROR,
                message: error.message
            });
        }
    }

    async function getAllReports() {
        try {
            const result = await analysisList.findAllReports();
            if (result) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: result,
                    message: ''
                });
            } else {
                return objectHandler({
                    code: HttpResponseType.NOT_FOUND,
                    message: 'Reports collection is empty'
                });
            }
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.INTERNAL_SERVER_ERROR,
                message: error.message
            });
        }
    }

    async function getAllReportsForAccount(httpRequest) {
        const { accountNumber } = httpRequest.queryParams;

        try {
            const result = await analysisList.findReportsByAccNumber({ accountNumber });
            if (result) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: result,
                    message: ''
                });
            } else {
                return objectHandler({
                    code: HttpResponseType.NOT_FOUND,
                    message: `Requested Reports for consumer '${accountNumber}' not found`
                });
            }
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.INTERNAL_SERVER_ERROR,
                message: error.message
            });
        }
    }

    async function getReportsForYear(httpRequest) {
        const { accountNumber, year } = httpRequest.queryParams;

        try {
            const result = await analysisList.findReportsForYear(accountNumber, year);
            if (result) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: result,
                    message: ''
                });
            } else {
                return objectHandler({
                    code: HttpResponseType.NOT_FOUND,
                    message: `Requested Reports for consumer '${accountNumber}' in '${year}' not found`
                });
            }
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.INTERNAL_SERVER_ERROR,
                message: error.message
            });
        }
    }

    async function getReportForMonth(httpRequest) {
        const { accountNumber, year, month } = httpRequest.queryParams;

        try {
            const result = await analysisList.findReportForMonth(accountNumber, year, month);
            if (result) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: result,
                    message: ''
                });
            } else {
                return objectHandler({
                    code: HttpResponseType.NOT_FOUND,
                    message: `Requested Reports for consumer '${accountNumber}' in '${year}-${month}' not found`
                });
            }
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.INTERNAL_SERVER_ERROR,
                message: error.message
            });
        }
    }

    function getCurrentMonthStats(type, stats) {
        if (type === 'PGSB') {
            stats.sort(dateComparePG);
        }

        if (type === 'PVSB') {
            stats.sort(dateComparePV);
        }

        return {
            startingValue: stats[0],
            endingValue: stats[stats.length - 1]
        };
    }
}
