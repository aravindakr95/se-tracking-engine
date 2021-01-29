import { makeTwoDecimalNumber } from '../utilities/number-resolver';

function calculateIncome(dateTime, consumer, bfUnits) {
    const establishedDuration = dateTime.getFullYear() - consumer.establishedYear;

    if (establishedDuration <= 7 && establishedDuration > 0) {
        return consumer.tariff === 'Net Metering' ? 0 : bfUnits * 22.00;
    } else {
        return consumer.tariff === 'Net Metering' ? 0 : bfUnits * 15.50;
    }
}

function calculateFixedCharge(units) {
    if (units > 60) {
        if (units > 180)
            return 540.00;
        if (units >= 121)
            return 480.00;
        if (units >= 91)
            return 480.00;
        if (units >= 61)
            return 90.00;
        if (units >= 0)
            return 0;
    }

    if (units <= 60) {
        if (units >= 31)
            return 60.00;
        if (units >= 0)
            return 30.00;
    }
}

function calculateUnitCharges(days, units) {
    if (units > 60) {
        return priceBlockOne(days, units);
    }

    if (units <= 60) {
        return priceBlockOne(days, units, 'BELOW_CATEGORY');
    }
}

function priceBlockOne(days, units, type = 'ABOVE_CATEGORY') {
    const unitCost = type === 'ABOVE_CATEGORY' ? 7.85 : 2.50;
    const applicableUnits = units - days;

    if (units < days) {
        return unitCost * units;
    }

    if (applicableUnits > 0) {
        const remainBlocks = priceBlockTwo(days, applicableUnits, type);
        return (unitCost * days) + remainBlocks;
    }

    return unitCost * days;
}

function priceBlockTwo(days, units, type = 'ABOVE_CATEGORY') {
    const unitCost = type === 'ABOVE_CATEGORY' ? 7.85 : 4.85;
    const applicableUnits = units - days;

    if (units < days) {
        return unitCost * units;
    }

    if (applicableUnits > 0) {
        const remainBlocks = priceBlockThree(days, applicableUnits);
        return (unitCost * days) + remainBlocks;
    }

    return unitCost * days;
}

function priceBlockThree(days, units) {
    const unitCost = 10.00;
    const applicableUnits = units - days;

    if (units < days) {
        return unitCost * units;
    }

    if (applicableUnits > 0) {
        const remainBlocks = priceBlockFour(days, applicableUnits);
        return (unitCost * days) + remainBlocks;
    }

    return unitCost * days;
}

function priceBlockFour(days, units) {
    const unitCost = 27.75;
    const applicableUnits = units - days;

    if (units < days) {
        return unitCost * units;
    }

    if (applicableUnits > 0) {
        const remainBlocks = priceBlockFive(days, applicableUnits);
        return (unitCost * days) + remainBlocks;
    }

    return (unitCost * days);
}

function priceBlockFive(days, units) {
    const unitCost = 32.00;
    const applicableUnits = units - (days * 2);

    if (units < days) {
        return unitCost * units;
    }

    if (applicableUnits > 0) {
        const remainBlocks = priceBlockSix(applicableUnits);
        return unitCost * (days * 2) + remainBlocks;
    }

    return unitCost * (days * 2);
}

function priceBlockSix(units) {
    const unitCost = 45.00;
    return unitCost * units;
}

function calculateExpense(category, days, units) {
    //todo: for the moment D-1 only
    if (category !== 'D-1') {
        return {
            fixedCharge: 0,
            grossAmount: 0,
            netAmount: 0
        };
    }

    const grossAmount = calculateUnitCharges(days, units);
    const fixedCharge = calculateFixedCharge(units);
    const netAmount = grossAmount + fixedCharge;

    return {
        fixedCharge: makeTwoDecimalNumber(fixedCharge),
        grossAmount: makeTwoDecimalNumber(grossAmount),
        netAmount: makeTwoDecimalNumber(netAmount)
    };
}

module.exports = {
    calculateIncome,
    calculateExpense
};
