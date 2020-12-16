import config from '../config/config';

import HttpResponseType from '../models/http/http-response-type';
import AccountStatus from '../models/common/account-status';
import DeviceType from '../models/common/device-type';

import { CustomException } from '../helpers/utilities/custom-exception';
import { objectHandler } from '../helpers/utilities/normalize-request';
import { daysInPreviousMonth, getCurrentMonthString, getPreviousDate } from '../helpers/utilities/date-resolver';
import { calculateProduction, calculateConsumption } from '../helpers/utilities/throughput-resolver';
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

        let groundFloorPGStats = [];
        let firstFloorPGStats = [];

        try {
            const { dateInstance, billingPeriod, month, year } = getPreviousDate();
            const billingDuration = daysInPreviousMonth();

            const log = await analysisList.findReportLog({ billingPeriod });

            if (log && log.isCompleted) {
                throw CustomException(
                    `Reports already generated for '${billingPeriod}' month`,
                    HttpResponseType.CONFLICT
                );
            }

            const consumers = await consumerList.findConsumersByStatus({ status: AccountStatus.ACTIVE })
                .catch(error => {
                    throw CustomException(error.message);
                });

            if (consumers && consumers.length) {
                let uniqueDeviceIds = [];

                for (const consumer of consumers) {
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

                    const pgsbStats = await pgsbList.findAllPGStatsByDeviceIds(uniqueDeviceIds)
                        .catch(error => {
                            throw CustomException(error.message);
                        });

                    const pvsbStats = await pvsbList.findAllPVStatsByAccountNumber({ accountNumber })
                        .catch(error => {
                            throw CustomException(error.message);
                        });

                    if (!(pvsbStats && pvsbStats.length) || !(pgsbStats && pgsbStats.length)) {
                        continue;
                    }

                    pgsbStats.filter(stat => {
                        stat.slaveId === 101 ? groundFloorPGStats.push(stat) :
                            firstFloorPGStats.push(stat);
                    });

                    const filteredPVSB = filterCurrentMonthStats(DeviceType.PVSB, pvsbStats);

                    const filteredGroundStats = filterCurrentMonthStats(DeviceType.PGSB, groundFloorPGStats);
                    const filteredFirstStats = filterCurrentMonthStats(DeviceType.PGSB, firstFloorPGStats);

                    if (!(filteredPVSB && filteredPVSB.length) ||
                        !(filteredGroundStats && filteredFirstStats.length) ||
                        !(filteredFirstStats && filteredFirstStats.length)) {
                        continue;
                    }

                    const sortedPVSB = sortCurrentMonthStats(DeviceType.PVSB, filteredPVSB);

                    const sortedGroundPGSB = sortCurrentMonthStats(DeviceType.PGSB, filteredGroundStats);
                    const sortedFirstPGSB = sortCurrentMonthStats(DeviceType.PGSB, filteredFirstStats);

                    const energyToday = filteredPVSB.map(stat => stat.energyToday);

                    const productionDetails = calculateProduction(
                        sortedPVSB,
                        energyToday);

                    const consumptionDetails = calculateConsumption(
                        dateInstance,
                        consumer,
                        sortedGroundPGSB,
                        sortedFirstPGSB,
                        productionDetails,
                        billingDuration);

                    const forecastPeriod = getCurrentMonthString(dateNow);

                    const forecastValues = await forecastList.findForecastReportByAccountNumber(
                        accountNumber, forecastPeriod
                    ).catch(error => {
                        throw CustomException(error.message);
                    });

                    const forecastedValues = {
                        forecastedPayable: forecastValues.value
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
                    return objectHandler({
                        status: HttpResponseType.SUCCESS,
                        message: `Reports generated for '${billingPeriod}' is completed`
                    });
                }
            }

            throw CustomException('Consumers collection is empty', HttpResponseType.NOT_FOUND);
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
                const templateReport = Object.assign(report, {
                    bodyTitle: `Electricity EBILL for ${billingPeriod}`,
                    currency: config.currency,
                    supplier: config.supplier
                });

                if (report && report.tariff === 'Net Metering') {
                    //WARNING: limited resource use with care
                    await sendEmailPostMark(templateReport, 'monthly-statement-nm').catch(error => {
                        throw CustomException(error.message);
                    });
                } else {
                    //WARNING: limited resource use with care
                    await sendEmailPostMark(templateReport, 'monthly-statement-na').catch(error => {
                        throw CustomException(error.message);
                    });
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

        if (type === DeviceType.PGSB) {
            filteredStats = stats.filter(stat =>
                stat.timestamp >= startingMillis && stat.timestamp <= endingMillis);

            filteredStats.sort((dateOne, dateTwo) => dateOne - dateTwo);
        }

        if (type === DeviceType.PVSB) {
            filteredStats = stats.filter(stat =>
                stat.snapshotTimestamp >= startingMillis && stat.snapshotTimestamp <= endingMillis);
        }

        return filteredStats;
    }

    function sortCurrentMonthStats(type, stats) {
        if (type === DeviceType.PGSB) {
            stats.sort((objOne, objTwo) => objOne.timestamp - objTwo.timestamp);
        }

        if (type === DeviceType.PVSB) {
            stats.sort((objOne, objTwo) => objOne.snapshotTimestamp - objTwo.snapshotTimestamp);
        }

        return {
            startingValue: stats[0],
            endingValue: stats[stats.length - 1]
        };
    }
}
