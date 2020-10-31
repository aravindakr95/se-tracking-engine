import { makeTwoDecimalFixed } from './number-resolver';
import { calculateIncome, calculateExpense } from './price-resolver';

function calculateProduction(pvsb, energy, length) {
    const { startingValue, endingValue } = pvsb;
    const energyTotal = energy.reduce((valueOne, valueTwo) => valueOne + valueTwo, 0);

    const totalProduction = makeTwoDecimalFixed(endingValue.totalEnergy -
        startingValue.totalEnergy);
    const avgDailyProduction = makeTwoDecimalFixed(energyTotal / length);

    return {
        totalProduction,
        avgDailyProduction
    }
}

function calculateConsumption(dateTime, consumer, pgsb, production, duration) {
    let bfUnits = 0;
    let totalGridImported = 0;
    let income = 0.00;
    let payableAmount = 0.00;

    const { startingValue, endingValue } = pgsb;

    const totalConsumption = makeTwoDecimalFixed(endingValue.totalPower - startingValue.totalPower);
    const excessEnergy = makeTwoDecimalFixed(production.totalProduction - totalConsumption);

    const avgDailyConsumption = makeTwoDecimalFixed(totalConsumption / duration);

    if (excessEnergy > 0) {
        bfUnits = consumer.tariff === 'NetMetering' ? excessEnergy : 0;
    } else {
        totalGridImported = Number(Math.abs(excessEnergy).toFixed(2));
    }

    if (excessEnergy) {
        income = calculateIncome(dateTime, consumer, excessEnergy);
    }

    if (totalGridImported) {
        payableAmount = calculateExpense(consumer.billingCategory, totalGridImported);
    }

    return {
        yield: income,
        payableAmount,
        bfUnits,
        totalGridImported,
        totalConsumption,
        avgDailyConsumption
    }
}

module.exports = { calculateProduction, calculateConsumption }
