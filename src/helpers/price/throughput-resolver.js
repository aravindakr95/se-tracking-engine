import SchemaType from '../../enums/account/schema-type';

import { calculateIncome, calculateExpense } from './price-resolver';
import { makeTwoDecimalNumber } from '../utilities/number-resolver';
import { CustomException } from '../utilities/custom-exception';

function calculateDailyProduction(pvStats) {
    if (!pvStats || (!pvStats.latest || !pvStats.oldest)) {
        throw CustomException('PV stats, PV stats latest or old fields are empty');
    }

    const result = pvStats.latest.totalEnergy - pvStats.oldest.totalEnergy;

    return makeTwoDecimalNumber(result);
}

function calculateDailyConsumption(pgStats) {
    if (!pgStats || (!pgStats[0].latest.length || !pgStats[0].oldest.length)) {
        throw CustomException('PG stats, PG stats latest or old fields are empty');
    }

    const groundFloorLatest = pgStats[0].latest
        .find(stat => stat._id === 101);

    const firstFloorLatest = pgStats[0].latest
        .find(stat => stat._id === 201);

    const groundFloorOldest = pgStats[0].oldest
        .find(stat => stat._id === 101);

    const firstFloorOldest = pgStats[0].oldest
        .find(stat => stat._id === 201);

    if (!groundFloorLatest || (!groundFloorLatest.result || !firstFloorLatest.result) ||
        (!groundFloorOldest.result || !firstFloorOldest.result)) {
        throw CustomException('One or more data fields are empty');
    }

    const result = (groundFloorLatest.result.totalPower - groundFloorOldest.result.totalPower) +
        (firstFloorLatest.result.totalPower - firstFloorOldest.result.totalPower);

    return makeTwoDecimalNumber(result);
}

function calculateMonthlyProduction(pvStats, duration) {
    if (!pvStats || (!pvStats.latest || !pvStats.oldest)) {
        throw CustomException('PV stats, PV stats latest or old fields are empty');
    }
    const { latest, oldest } = pvStats;

    const totalProduction = latest.totalEnergy - oldest.totalEnergy;
    const avgDailyProduction = totalProduction / duration;

    return {
        totalProduction: makeTwoDecimalNumber(totalProduction),
        avgDailyProduction: makeTwoDecimalNumber(avgDailyProduction)
    };
}

function calculateMonthlyConsumption(dateTime, consumer, pgStats, production, duration) {
    let bfUnits = 0;
    let income = 0;

    let totalGridImported = 0;
    let grossAmount = 0;
    let fixedCharge = 0;
    let netAmount = 0;

    let expense = null;

    if (!pgStats || (!pgStats[0].latest.length || !pgStats[0].oldest.length)) {
        throw CustomException('PG stats, PG stats latest or old fields are empty');
    }

    const groundFloorLatest = pgStats[0].latest
        .find(stat => stat._id === 101);

    const firstFloorLatest = pgStats[0].latest
        .find(stat => stat._id === 201);

    const groundFloorOldest = pgStats[0].oldest
        .find(stat => stat._id === 101);

    const firstFloorOldest = pgStats[0].oldest
        .find(stat => stat._id === 201);

    if (!groundFloorLatest || (!groundFloorLatest.result || !firstFloorLatest.result) ||
        (!groundFloorOldest.result || !firstFloorOldest.result)) {
        throw CustomException('One or more data fields are empty');
    }

    const totalConsumption = (groundFloorLatest.result.totalPower - groundFloorOldest.result.totalPower) +
        (firstFloorLatest.result.totalPower - firstFloorOldest.result.totalPower);

    const excessEnergy = production.totalProduction - totalConsumption;

    const avgDailyConsumption = totalConsumption / duration;

    if (excessEnergy > 0) {
        bfUnits = consumer.tariff === SchemaType.NET_METERING ? excessEnergy : -1;
        income = consumer.tariff === SchemaType.NET_ACCOUNTING ? calculateIncome(dateTime, consumer, excessEnergy) : -1;
    } else {
        totalGridImported = Math.abs(excessEnergy);
    }

    bfUnits = consumer.tariff === SchemaType.NET_METERING ? bfUnits : -1;
    income = consumer.tariff === SchemaType.NET_ACCOUNTING ? makeTwoDecimalNumber(income) : -1;

    if (totalGridImported) {
        expense = calculateExpense(consumer.billingCategory, duration, totalGridImported);

        grossAmount = expense.grossAmount;
        fixedCharge = expense.fixedCharge;
        netAmount = expense.netAmount;
    }

    return {
        previousDue: 0, //todo: payment API integration required (mock for the moment)
        yield: income,
        grossAmount,
        fixedCharge,
        netAmount,
        bfUnits: makeTwoDecimalNumber(bfUnits),
        totalGridImported: makeTwoDecimalNumber(totalGridImported),
        totalConsumption: makeTwoDecimalNumber(totalConsumption),
        avgDailyConsumption: makeTwoDecimalNumber(avgDailyConsumption)
    };
}

module.exports = {
    calculateDailyProduction,
    calculateDailyConsumption,
    calculateMonthlyProduction,
    calculateMonthlyConsumption
};
