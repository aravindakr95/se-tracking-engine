import HttpResponseType from '../models/common/http-response-type';
import { objectHandler } from '../helpers/utilities/normalize-request';
import { daysInMonth, dateComparePG, dateComparePV } from '../helpers/utilities/date-resolver';
import { calculateProduction, calculateConsumption } from '../helpers/utilities/throughput-resolver';
import { configSMS, sendSMS } from '../helpers/sms/messenger';
import sendEmail from '../helpers/mail/mailer';
import config from '../config/config';
import { getInvoiceTemplate } from '../helpers/templates/email/invoice';

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

    async function generateReports() {
        try {
            const dateTime = new Date();
            const currentMonth = dateTime.getMonth() + 1;
            const currentYear = dateTime.getFullYear();

            const billingDuration = daysInMonth();

            const log = await analysisList.findReportLog(currentMonth, currentYear);

            if (log && log.isCompleted) {
                return objectHandler({
                    code: HttpResponseType.CONFLICT,
                    message: `Reports already generated for '${currentYear}-${currentMonth}' current month`
                });
            }

            const response = await consumerList.getAllConsumers();

            if (response && response.length) {
                for (const consumer of response) {
                    let {
                        accountNumber,
                        contactNumber,
                        email,
                        supplier,
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
                        dateTime,
                        consumer,
                        sortedPGSBStats,
                        productionDetails,
                        billingDuration);

                    const commonDetails = {
                        accountNumber,
                        contactNumber,
                        email,
                        billingDuration,
                        supplier,
                        tariff,
                        billingCategory,
                        previousDue: 0.00, //todo: payment API integration required (mock for the moment)
                        month: currentMonth,
                        year: currentYear
                    };

                    const forecastedValues = {
                        forecastedPayable: 0.00 //todo: create a way to predict the total amount for next month
                    }

                    const report = Object.assign({},
                        productionDetails,
                        consumptionDetails,
                        commonDetails,
                        forecastedValues
                    );

                    await analysisList.addReport(report);
                }

                const reportLog = {
                    month: currentMonth,
                    year: currentYear,
                    isCompleted: true
                };

                const status = await analysisList.addReportLog(reportLog);

                if (status && status.isCompleted) {
                    return objectHandler({
                        status: HttpResponseType.SUCCESS,
                        message: `Reports generated for '${currentYear}-${currentMonth}' completed`
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

    async function dispatchReports() {
        try {
            const smsOptions = {
                url: config.ideabizSMSOut,
                method: 'post'
            };

            const dateTime = new Date();
            const year = dateTime.getFullYear();
            const month = dateTime.getMonth() + 1;
            const date = dateTime.getDate();

            const reports = await analysisList.findAllReportsForMonth(month, year);

            if (reports && !reports.length) {
                return objectHandler({
                    code: HttpResponseType.NOT_FOUND,
                    message: `Zero reports found for the '${year}-${month}'`
                });
            }

            for (const report of reports) {
                const smsMessage = `Your electricity account number ${report.accountNumber} able to produce ${report.totalProduction} kWh and consumed ${report.totalConsumption} kWh as of ${month}-${date}-${year}. This month you have to pay ${report.payableAmount} LKR for the excess energy used. For more descriptive details, please refer the email.`;

                const emailBody = getInvoiceTemplate(report);

                const sms = configSMS(report.contactNumber, smsMessage);

                //WARNING: limited resource use with care
                await sendSMS(smsOptions, sms).catch(error => console.log(error));

                //WARNING: limited resource use with care
                await sendEmail({
                    from: config.adminEmail,
                    to: report.email,
                    subject: `Statement for ${month}-${year} on SETE Account ${report.accountNumber}`,
                    html: emailBody
                }).catch(error => console.log(error));
            }

            return objectHandler({
                status: HttpResponseType.SUCCESS,
                message: `All consumer report summaries sent for '${year}-${month}'`
            });
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
                    message: `Reports collection is empty`
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
        }
    }
}
