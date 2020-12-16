import { makeTwoDecimalNumber } from './number-resolver';
import { calculateIncome, calculateExpense } from './price-resolver';

function calculateProduction(pvsb, energyToday) {
    const energyLength = energyToday.length;
    const { startingValue, endingValue } = pvsb;
    const energyTotal = energyToday.reduce((valueOne, valueTwo) => valueOne + valueTwo, 0);

    const totalProduction = makeTwoDecimalNumber(endingValue.totalEnergy - startingValue.totalEnergy);
    const avgDailyProduction = makeTwoDecimalNumber(energyTotal / energyLength);

    return {
        totalProduction,
        avgDailyProduction
    };
}

function calculateConsumption(dateTime, consumer, groundPgsb, firstPgsb, production, duration) {
    let bfUnits = 0;
    let income = 0;

    let totalGridImported = 0;
    let grossAmount = 0;
    let fixedCharge = 0;
    let netAmount = 0;

    let expense = null;

    if (!groundPgsb || !firstPgsb) {
        return null;
    }

    const groundTotalPower = groundPgsb.endingValue.totalPower - groundPgsb.startingValue.totalPower;
    const firstTotalPower = firstPgsb.endingValue.totalPower - firstPgsb.startingValue.totalPower;

    const totalConsumption = makeTwoDecimalNumber(groundTotalPower + firstTotalPower);
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

module.exports = { calculateProduction, calculateConsumption };
