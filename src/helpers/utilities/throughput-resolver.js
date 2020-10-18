import { makeTwoDecimalFixed } from './number-resolver';
import { calculateIncome, calculateExpense } from './price-resolver';

function calculateProduction(pvsb, energy, length) {
    const { startingValue, endingValue } = pvsb;
    const energyTotal = energy.reduce((valueOne, valueTwo) => valueOne + valueTwo, 0);

    const totalProduction = makeTwoDecimalFixed(endingValue.totalEnergy -
        startingValue.totalEnergy);
    const avDailyProduction = makeTwoDecimalFixed(energyTotal / length);

    return {
        totalProduction,
        avDailyProduction
    }
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

module.exports = { calculateProduction, calculateConsumption }
