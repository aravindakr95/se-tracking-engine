import HttpResponseType from '../models/http-response-type';
import { objectHandler } from '../helpers/utilities/normalize-request';
import { daysInMonth } from '../helpers/utilities/date-resolver';

export default function makeAnalysisEndPointHandler({ analysisList, userList, pvsbList, pgsbList }) {
    return async function handle(httpRequest) {
        switch (httpRequest.path) {
            case '/reports':
                if (httpRequest.pathParams &&
                    httpRequest.pathParams.accountNumber) {
                    return getSpecificAllReports(httpRequest);
                }

                if (httpRequest.queryParams &&
                    httpRequest.queryParams.year) {
                    return getSpecificYearReports(httpRequest);
                }

                if (httpRequest.queryParams &&
                    httpRequest.queryParams.year &&
                    httpRequest.queryParams.month) {
                    return getSpecificReport(httpRequest);
                }

                if (httpRequest.method === 'POST') {
                    return generateReports();
                }

                break;
            default:
                return objectHandler({
                    code: HttpResponseType.METHOD_NOT_ALLOWED,
                    message: `${httpRequest.method} method not allowed`
                });
        }
    };

    async function generateReports() {
        try {
            const response = await userList.getAllUsers();

            if (response && response.length) {
                const dateTime = new Date();

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
                    const date = new Date();

                    const report = {
                        accountNumber,
                        billingDuration,
                        month: date.getMonth() + 1,
                        year: date.getFullYear()
                    }

                    Object.assign(report, production, consumption);

                    console.log(report)

                    await analysisList.addReport(report);
                }

                return objectHandler({
                    status: HttpResponseType.SUCCESS,
                    message: `Reports generated for ${dateTime.getFullYear()}-${dateTime.getMonth() + 1} completed`
                });
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

    //todo: tobe implemented
    async function getSpecificAllReports(httpRequest) {}

    //todo: tobe implemented
    async function getSpecificYearReports(httpRequest) {}

    //todo: tobe implemented
    async function getSpecificReport(httpRequest) {}

    function dateComparePG(objectOne, objectTwo) {
        const startingDateTime = new Date();
        startingDateTime.setDate(1);

        const endingDateTime = new Date();
        endingDateTime.setDate(daysInMonth);

        const startingMillis = startingDateTime.setHours(0, 0, 0, 0);
        const endingMillis = endingDateTime.setHours(23, 59, 59, 999);

        if ((objectOne.timestamp >= startingMillis && objectOne.timestamp <= endingMillis) &&
            (objectTwo.timestamp >= startingMillis && objectTwo.timestamp <= endingMillis)) {
            return objectOne.timestamp - objectTwo.timestamp;
        }
    }

    function dateComparePV(objectOne, objectTwo) {
        const startingDateTime = new Date();
        startingDateTime.setDate(1);

        const endingDateTime = new Date();
        endingDateTime.setDate(daysInMonth);

        const startingMillis = startingDateTime.setHours(0, 0, 0, 0);
        const endingMillis = endingDateTime.setHours(23, 59, 59, 999);

        if ((objectOne.snapshotTimestamp >= startingMillis && objectOne.snapshotTimestamp <= endingMillis) &&
            (objectTwo.snapshotTimestamp >= startingMillis && objectTwo.snapshotTimestamp <= endingMillis)) {
            return objectOne.snapshotTimestamp - objectTwo.snapshotTimestamp;
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

    function calculateProduction(pvsb, energy, length) {
        const { startingValue, endingValue } = pvsb;
        const energyTotal = energy.reduce((a, b) => a + b, 0);

        const totalProduction = makeTwoDecimalFixed(endingValue.totalEnergy -
            startingValue.totalEnergy);
        const avDailyProduction = makeTwoDecimalFixed(energyTotal / length);

        return {
            totalProduction,
            avDailyProduction
        }
    }

    function makeTwoDecimalFixed(value) {
        const formatted = Number.parseFloat(value).toFixed(2);
        return Number(formatted);
    }

    function calculateConsumption(user, pgsb, production) {
        let bfUnits = 0;
        let totalGridImported = 0;
        let income = 0.00;
        let payableAmount = 0.00;

        const { startingValue, endingValue } = pgsb;

        const totalConsumption = makeTwoDecimalFixed(endingValue.totalPower - startingValue.totalPower);
        const excessEnergy = makeTwoDecimalFixed(production.totalProduction - totalConsumption);

        if (excessEnergy > 0) {
            bfUnits = user.tariff === 'NetMetering' ? excessEnergy : 0;
        } else {
            totalGridImported = Number(Math.abs(excessEnergy).toFixed(2));
        }

        if (excessEnergy) {
            income = calculateIncome(user, excessEnergy);
        }

        if (totalGridImported) {
            payableAmount = calculateExpense(user.billingCategory, totalGridImported);
        }

        return {
            yield: income,
            payableAmount,
            bfUnits,
            totalGridImported,
            totalConsumption
        }
    }

    function calculateIncome(user, bfUnits) {
        const date = new Date();
        const establishedDuration = date.getFullYear() - user.establishedYear;

        if (establishedDuration <= 7 && establishedDuration > 0) {
            return user.tariff === 'NetMetering' ? 0 : bfUnits * 22.00;
        } else {
            return user.tariff === 'NetMetering' ? 0 : bfUnits * 15.50;
        }
    }

    function calculateExpense(category, units) {
        if (category !== 'D-1') {
            return 0;
        }

        if (units <= 60) {
            if (units <= 30 && units > 0) {
                return 30 + (2.50 * units);
            }

            if (units > 30 && units <= 60) {
                return 60 + (4.85 * units);
            }
        }

        if (units > 60) {
            if (units <= 61 && units > 0) {
                return (7.85 * units); // no fixed charge
            }

            if (units > 60 && units <= 90) {
                return 90 + (10 * units);
            }

            if (units > 90 && units <= 120) {
                return 480 + (27.75 * units);
            }

            if (units > 120 && units <= 180) {
                return 480 + (32.00 * units);
            }

            if (units > 180) {
                return 540 + (45 * units);
            }
        }
    }
}
