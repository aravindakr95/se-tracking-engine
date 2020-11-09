import config from '../config/config';

import HttpResponseType from '../models/common/http-response-type';

import { objectHandler } from '../helpers/utilities/normalize-request';
import { daysInPreviousMonth, getPreviousDate } from '../helpers/utilities/date-resolver';
import { calculateProduction, calculateConsumption } from '../helpers/utilities/throughput-resolver';
import { configSMS, sendSMS } from '../helpers/sms/messenger';
import { sendEmailPostMark } from '../helpers/mail/mailer';
import { getInvoiceSMSTemplate } from '../helpers/templates/sms/sms-broker';

export default function makeAnalysisEndPointHandler({ analysisList, consumerList, pvsbList, pgsbList }) {
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

            const response = await consumerList.getAllConsumers().catch(error => {
                console.log(error);
                return objectHandler({
                    code: HttpResponseType.INTERNAL_SERVER_ERROR,
                    message: error.message
                });
            });

            if (response && response.length) {
                for (const consumer of response) {
                    let {
                        accountNumber,
                        contactNumber,
                        email,
                        tariff,
                        billingCategory
                    } = consumer;

                    const pgsbDeviceId = await consumerList.findDeviceIdByAccNumber(accountNumber, 'PGSB')
                        .catch(error => {
                            console.log(error);
                            return objectHandler({
                                code: HttpResponseType.INTERNAL_SERVER_ERROR,
                                message: error.message
                            });
                        });

                    const pgsbStats = await pgsbList.findAllPGStatsByDeviceId({ deviceId: pgsbDeviceId })
                        .catch(error => {
                            console.log(error);
                            return objectHandler({
                                code: HttpResponseType.INTERNAL_SERVER_ERROR,
                                message: error.message
                            });
                        });

                    const pvsbDeviceId = await consumerList.findDeviceIdByAccNumber(accountNumber, 'PVSB')
                        .catch(error => {
                            console.log(error);
                            return objectHandler({
                                code: HttpResponseType.INTERNAL_SERVER_ERROR,
                                message: error.message
                            });
                        });

                    const pvsbStats = await pvsbList.findAllPVStatsByDeviceId({ deviceId: pvsbDeviceId })
                        .catch(error => {
                            console.log(error);
                            return objectHandler({
                                code: HttpResponseType.INTERNAL_SERVER_ERROR,
                                message: error.message
                            });
                        });

                    if (!(pvsbStats && pvsbStats.length) || !(pgsbStats && pgsbStats.length)) {
                        continue;
                    }

                    const filteredPVSB = filterCurrentMonthStats('PVSB', pvsbStats);
                    const filteredPGSB = filterCurrentMonthStats('PGSB', pgsbStats);

                    if (!(filteredPVSB && filteredPVSB.length) || !(filteredPGSB && filteredPGSB.length)) {
                        continue;
                    }

                    const sortedPVSB = sortCurrentMonthStats('PVSB', filteredPVSB);
                    const sortedPGSB = sortCurrentMonthStats('PGSB', filteredPGSB);

                    const energyToday = filteredPVSB.map(stat => stat.energyToday);

                    const productionDetails = calculateProduction(
                        sortedPVSB,
                        energyToday);

                    const consumptionDetails = calculateConsumption(
                        dateInstance,
                        consumer,
                        sortedPGSB,
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

                    await analysisList.addReport(report).catch(error => {
                        return objectHandler({
                            code: HttpResponseType.INTERNAL_SERVER_ERROR,
                            message: error.message
                        });
                    });
                }

                const reportLog = {
                    billingPeriod,
                    isCompleted: true
                };

                const status = await analysisList.addReportLog(reportLog).catch(error => {
                    return objectHandler({
                        code: HttpResponseType.INTERNAL_SERVER_ERROR,
                        message: error.message
                    });
                });

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

            const reports = await analysisList.findAllReportsForMonth({ billingPeriod })
                .catch(error => {
                    return objectHandler({
                        code: HttpResponseType.INTERNAL_SERVER_ERROR,
                        message: error.message
                    });
                });

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

                if (report && report.tariff === 'Net Metering') {
                    //WARNING: limited resource use with care
                    await sendEmailPostMark(templateReport, 'monthly-statement-nm').catch(error => {
                        return objectHandler({
                            code: HttpResponseType.INTERNAL_SERVER_ERROR,
                            message: error.message
                        });
                    });
                } else {
                    //WARNING: limited resource use with care
                    await sendEmailPostMark(templateReport, 'monthly-statement-na').catch(error => {
                        return objectHandler({
                            code: HttpResponseType.INTERNAL_SERVER_ERROR,
                            message: error.message
                        });
                    });
                }
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
            const result = await analysisList.findAllReports().catch(error => {
                return objectHandler({
                    code: HttpResponseType.INTERNAL_SERVER_ERROR,
                    message: error.message
                });
            });

            if (result && result.length) {
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
            const result = await analysisList.findReportsByAccNumber({ accountNumber }).catch(error => {
                return objectHandler({
                    code: HttpResponseType.INTERNAL_SERVER_ERROR,
                    message: error.message
                });
            });

            if (result && result.length) {
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
            const result = await analysisList.findReportsForYear(accountNumber, year).catch(error => {
                return objectHandler({
                    code: HttpResponseType.INTERNAL_SERVER_ERROR,
                    message: error.message
                });
            });

            if (result && result.length) {
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
            const result = await analysisList.findReportForMonth(accountNumber, year, month).catch(error => {
                return objectHandler({
                    code: HttpResponseType.INTERNAL_SERVER_ERROR,
                    message: error.message
                });
            });

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

    async function getReportByInvoiceID(httpRequest) {
        const { _id } = httpRequest.pathParams;

        try {
            const result = await analysisList.findReportByInvoiceID({ _id }).catch(error => {
                return objectHandler({
                    code: HttpResponseType.INTERNAL_SERVER_ERROR,
                    message: error.message
                });
            });

            if (result) {
                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    data: result,
                    message: ''
                });
            } else {
                return objectHandler({
                    code: HttpResponseType.NOT_FOUND,
                    message: `Requested Reports '${_id}' not found`
                });
            }
        } catch (error) {
            return objectHandler({
                code: HttpResponseType.INTERNAL_SERVER_ERROR,
                message: error.message
            });
        }
    }

    function filterCurrentMonthStats(type, stats) {
        const startingDate = new Date();
        const endingDate = new Date();

        let filteredStats = [];

        startingDate.setDate(0);
        startingDate.setDate(1);

        endingDate.setDate(0);
        endingDate.setDate(daysInPreviousMonth());

        const startingMillis = startingDate.setHours(0, 0, 0, 1);
        const endingMillis = endingDate.setHours(23, 59, 59, 999);

        if (type === 'PGSB') {
            filteredStats = stats.filter(stat =>
                stat.timestamp >= startingMillis && stat.timestamp <= endingMillis);

            filteredStats.sort((dateOne, dateTwo) => dateOne - dateTwo);
        }

        if (type === 'PVSB') {
            filteredStats = stats.filter(stat =>
                stat.snapshotTimestamp >= startingMillis && stat.snapshotTimestamp <= endingMillis);
        }

        return filteredStats;
    }

    function sortCurrentMonthStats(type, stats) {
        if (type === 'PGSB') {
            stats.sort((objOne, objTwo) => objOne.timestamp - objTwo.timestamp);
        }

        if (type === 'PVSB') {
            stats.sort((objOne, objTwo) => objOne.snapshotTimestamp - objTwo.snapshotTimestamp);
        }

        return {
            startingValue: stats[0],
            endingValue: stats[stats.length - 1]
        };
    }
}
