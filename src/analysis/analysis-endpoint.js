import HttpResponseType from '../models/http-response-type';
import { objectHandler } from '../helpers/utilities/normalize-request';
import { daysInMonth, dateComparePG, dateComparePV } from '../helpers/utilities/date-resolver';
import { calculateProduction, calculateConsumption } from '../helpers/utilities/throughput-resolver';

export default function makeAnalysisEndPointHandler({ analysisList, userList, pvsbList, pgsbList }) {
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

            const log = await analysisList.findReportLog(currentMonth, currentYear);

            if (log && log.isCompleted) {
                return objectHandler({
                    code: HttpResponseType.CONFLICT,
                    message: `Reports already generated for '${currentYear}-${currentMonth}' current month`
                });
            }

            const response = await userList.getAllUsers();

            if (response && response.length) {
                for (const user of response) {
                    let { accountNumber } = user;

                    const pgsbDeviceId = await userList.findDeviceIdByAccNumber({ accountNumber }, 'PGSB');
                    const pgsbStats = await pgsbList.findAllPGStatsByDeviceId({ deviceId: pgsbDeviceId });

                    const pvsbDeviceId = await userList.findDeviceIdByAccNumber({ accountNumber }, 'PVSB');
                    const pvsbStats = await pvsbList.findAllPVStatsByDeviceId({ deviceId: pvsbDeviceId });

                    const sortedPVSBStats = getCurrentMonthStats('PVSB', pvsbStats);
                    const sortedPGSBStats = getCurrentMonthStats('PGSB', pgsbStats);

                    const energyToday = pvsbStats.map(stat => stat.energyToday);

                    const production = calculateProduction(sortedPVSBStats, energyToday, energyToday.length);
                    const consumption = calculateConsumption(user, sortedPGSBStats, production);

                    const billingDuration = daysInMonth();

                    const report = {
                        accountNumber,
                        billingDuration,
                        month: currentMonth,
                        year: currentYear
                    }

                    Object.assign(report, production, consumption);

                    console.log(report)

                    await analysisList.addReport(report);
                }

                const log = {
                    month: currentMonth,
                    year: currentYear,
                    isCompleted: true
                }

                const status = await analysisList.addReportLog(log);

                if (status && status.isCompleted) {
                    return objectHandler({
                        status: HttpResponseType.SUCCESS,
                        message: `Reports generated for '${currentYear}-${currentMonth}' completed`
                    });
                }
            }

            return objectHandler({
                code: HttpResponseType.NOT_FOUND,
                message: 'Users collection is empty'
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
                    message: `Requested Reports for user '${accountNumber}' not found`
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
                    message: `Requested Reports for user '${accountNumber}' in '${year}' not found`
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
                    message: `Requested Reports for user '${accountNumber}' in '${year}-${month}' not found`
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
