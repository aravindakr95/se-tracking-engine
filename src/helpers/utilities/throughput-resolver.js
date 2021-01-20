import { makeTwoDecimalNumber } from './number-resolver';
import { calculateIncome, calculateExpense } from './price-resolver';
import { CustomException } from './custom-exception';

function calculateDailyProduction(pvStats) {
    if (!pvStats || (!pvStats.latest || !pvStats.oldest)) {
        throw CustomException('CalculateDailyProduction(): PV stats, PV stats latest or old fields are empty');
    }

    const result = pvStats.latest.totalEnergy - pvStats.oldest.totalEnergy;

    return makeTwoDecimalNumber(result);
}

function calculateDailyConsumption(pgStats) {
    if (!pgStats || (!pgStats[0].latest.length || !pgStats[0].oldest.length)) {
        throw CustomException('CalculateDailyConsumption(): PG stats, PG stats latest or old fields are empty');
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
        throw CustomException('CalculateDailyConsumption(): One or more data fields are empty');
    }

    const result = (groundFloorLatest.result.totalPower - groundFloorOldest.result.totalPower) +
        (firstFloorLatest.result.totalPower - firstFloorOldest.result.totalPower);

    return makeTwoDecimalNumber(result);
}

function calculateMonthlyProduction(pvStats, duration) {

    if (!pvStats || (!pvStats.latest || !pvStats.oldest)) {
        throw CustomException('CalculateMonthlyProduction(): PV stats, PV stats latest or old fields are empty');
    }
    const { latest, oldest } = pvStats;

    const totalProduction = makeTwoDecimalNumber(latest.totalEnergy - oldest.totalEnergy);
    const avgDailyProduction = makeTwoDecimalNumber(totalProduction / duration);

    return {
        totalProduction,
        avgDailyProduction
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
        throw CustomException('CalculateMonthlyConsumption(): PG stats, PG stats latest or old fields are empty');
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
        throw CustomException('CalculateMonthlyConsumption(): One or more data fields are empty');
    }

    const totalConsumption = makeTwoDecimalNumber(
        (groundFloorLatest.result.totalPower - groundFloorOldest.result.totalPower) +
        (firstFloorLatest.result.totalPower - firstFloorOldest.result.totalPower)
    );

    const excessEnergy = makeTwoDecimalNumber(production.totalProduction - totalConsumption);

    const avgDailyConsumption = makeTwoDecimalNumber(totalConsumption / duration);

    if (excessEnergy > 0) {
        bfUnits = consumer.tariff === 'Net Metering' ? excessEnergy : -1;

        income = consumer.tariff === 'Net Accounting' ? calculateIncome(dateTime, consumer, excessEnergy) : -1;
        income = makeTwoDecimalNumber(income);
    } else {
        totalGridImported = Math.abs(excessEnergy);
        totalGridImported = makeTwoDecimalNumber(totalGridImported);
    }

    bfUnits = consumer.tariff === 'Net Metering' ? bfUnits : -1;
    income = consumer.tariff === 'Net Accounting' ? income : -1;

    if (totalGridImported) {
        expense = calculateExpense(consumer.billingCategory, totalGridImported);

        grossAmount = makeTwoDecimalNumber(expense.grossAmount);
        fixedCharge = makeTwoDecimalNumber(expense.fixedCharge);
        netAmount = makeTwoDecimalNumber(expense.netAmount);
    }

    return {
        previousDue: 0, //todo: payment API integration required (mock for the moment)
        yield: income,
        grossAmount,
        fixedCharge,
        netAmount,
        bfUnits,
        totalGridImported,
        totalConsumption,
        avgDailyConsumption
    };
}

module.exports = {
    calculateDailyProduction,
    calculateDailyConsumption,
    calculateMonthlyProduction,
    calculateMonthlyConsumption
};
