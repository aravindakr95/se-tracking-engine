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
        return priceBlockOne(days, units, 'secondary');
    }
}

function priceBlockOne(days, units, type = 'primary') {
    const unitCost = type === 'primary' ? 7.85 : 2.50;
    const applicableUnits = units - days;

    let remainBlocks = 0;

    if (units < days) {
        return units * unitCost;
    }

    if (applicableUnits > 0) {
        remainBlocks = priceBlockTwo(days, applicableUnits, type);
    }

    return (days * unitCost) + remainBlocks;
}

function priceBlockTwo(days, units, type = 'primary') {
    const unitCost = type === 'primary' ? 7.85 : 4.85;
    const applicableUnits = units - days;

    let remainBlocks = 0;

    if (units < days) {
        return units * unitCost;
    }

    if (applicableUnits > 0) {
        remainBlocks = priceBlockThree(days, applicableUnits);
    }

    return (days * unitCost) + remainBlocks;
}

function priceBlockThree(days, units) {
    let remainBlocks = 0;
    const applicableUnits = units - days;

    if (units < days) {
        return units * 10.00;
    }

    if (applicableUnits > 0) {
        remainBlocks = priceBlockFour(days, applicableUnits);
    }

    return (days * 10.00) + remainBlocks;
}

function priceBlockFour(days, units) {
    let remainBlocks = 0;
    const applicableUnits = units - days;

    if (units < days) {
        return units * 27.75 + remainBlocks;
    }

    if (applicableUnits > 0) {
        remainBlocks = priceBlockFive(days, applicableUnits);
    }

    return (days * 27.75) + remainBlocks;
}

function priceBlockFive(days, units) {
    let remainBlocks = 0;
    const applicableUnits = units - (days * 2);

    if (units < days) {
        return (units * 2) * 32.00 + remainBlocks;
    }

    if (applicableUnits > 0) {
        remainBlocks = priceBlockSix(days, applicableUnits);
    }

    return ((days * 2) * 32.00) + remainBlocks;
}

function priceBlockSix(days, units) {
    if (units < days) {
        return units * 45.00;
    }

    return days * 45;
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
        fixedCharge,
        grossAmount,
        netAmount
    };
}

module.exports = {
    calculateIncome,
    calculateExpense
};
