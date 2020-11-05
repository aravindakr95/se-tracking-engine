import { makeTwoDecimalNumber } from './number-resolver';
import { calculateIncome, calculateExpense } from './price-resolver';

function calculateProduction(pvsb, energy, length) {
    const { startingValue, endingValue } = pvsb;
    const energyTotal = energy.reduce((valueOne, valueTwo) => valueOne + valueTwo, 0);

    const totalProduction = makeTwoDecimalNumber(endingValue.totalEnergy -
        startingValue.totalEnergy);
    const avgDailyProduction = makeTwoDecimalNumber(energyTotal / length);

    return {
        totalProduction,
        avgDailyProduction
    };
}

function calculateConsumption(dateTime, consumer, pgsb, production, duration) {
    let bfUnits = 0;
    let income = 0;

    let totalGridImported = 0;
    let grossAmount = 0;
    let fixedCharge = 0;
    let netAmount = 0;

    let expense = null;

    const { startingValue, endingValue } = pgsb;

    const totalConsumption = makeTwoDecimalNumber(endingValue.totalPower - startingValue.totalPower);
    const excessEnergy = makeTwoDecimalNumber(production.totalProduction - totalConsumption);

    const avgDailyConsumption = makeTwoDecimalNumber(totalConsumption / duration);

    if (excessEnergy > 0) {
        bfUnits = consumer.tariff === 'NetMetering' ? excessEnergy : -1;

        income = consumer.tariff === 'NetAccounting' ? calculateIncome(dateTime, consumer, excessEnergy) : -1;
        income = makeTwoDecimalNumber(income);
    } else {
        totalGridImported = Math.abs(excessEnergy);
        totalGridImported = makeTwoDecimalNumber(totalGridImported);
    }

    bfUnits = consumer.tariff === 'NetMetering' ? bfUnits : -1;
    income = consumer.tariff === 'NetAccounting' ? income : -1;

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

module.exports = { calculateProduction, calculateConsumption };
