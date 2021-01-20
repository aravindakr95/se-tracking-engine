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

function calculateUnitCharges(units) {
    if (units > 60) {
        if (units > 180)
            return priceBlockSeven(units);
        if (units >= 121)
            return priceBlockSix(units);
        if (units >= 91)
            return priceBlockFive(units);
        if (units >= 61)
            return priceBlockFour(units);
        if (units >= 0)
            return priceBlockThree(units);
    }

    if (units <= 60) {
        if (units >= 31)
            return priceBlockTwo(units);
        if (units >= 0)
            return priceBlockOne(units);
    }
}

function priceBlockOne(units) {
    return 2.50 * units;
}

function priceBlockTwo(units) {
    const blockOne = priceBlockOne(30);
    return (4.85 * (units - 30)) + blockOne;
}

function priceBlockThree(units) {
    return 7.85 * units;
}

function priceBlockFour(units) {
    const blockThree = priceBlockThree(60);
    return (10 * (units - 60) + blockThree);
}

function priceBlockFive(units) {
    const blockFour = priceBlockFour(90);
    return (27.75 * (units - 90) + blockFour);
}

function priceBlockSix(units) {
    const blockFive = priceBlockFive(120);
    return (32.00 * (units - 120) + blockFive);
}

function priceBlockSeven(units) {
    const blockSix = priceBlockSix(180);
    return (32.00 * (units - 180) + blockSix);
}

function calculateExpense(category, units) {
    //todo: for the moment D-1 only
    if (category !== 'D-1') {
        return {
            fixedCharge: 0,
            grossAmount: 0,
            netAmount: 0
        };
    }

    const grossAmount = calculateUnitCharges(units);
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
