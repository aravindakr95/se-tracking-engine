import config from '../../config/config';

import PriceCategories from '../../enums/account/price-categories';
import SchemaType from '../../enums/account/schema-type';


import { makeTwoDecimalNumber } from '../utilities/number-resolver';

function calculateIncome(dateTime, consumer, bfUnits) {
    const establishedDuration = dateTime.getFullYear() - consumer.establishedYear;

    if (establishedDuration <= 7 && establishedDuration > 0) {
        return consumer.tariff === SchemaType.NET_ACCOUNTING ?
            bfUnits * config.prices.export.blockTwo : 0;
    } else {
        return consumer.tariff === SchemaType.NET_ACCOUNTING ?
            bfUnits * config.prices.export.blockOne : 0;
    }
}

function calculateFixedCharge(units) {
    if (units > 60) {
        if (units > 180)
            return config.prices.fixed.blockFive;
        if (units >= 91)
            return config.prices.fixed.blockFour;
        if (units >= 61)
            return config.prices.fixed.blockThree;
    }

    if (units <= 60) {
        if (units >= 31)
            return config.prices.fixed.blockTwo;
        if (units >= 0)
            return config.prices.fixed.blockOne;
    }
}

function calculateUnitCharges(days, units) {
    if (units > 60) {
        return priceBlockOne(days, units);
    }

    if (units <= 60) {
        return priceBlockOne(days, units, PriceCategories.BELOW);
    }
}

function priceBlockOne(days, units, type = PriceCategories.ABOVE) {
    const unitCost = type === PriceCategories.ABOVE ?
        config.prices.import.blockThree : config.prices.import.blockOne;
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

function priceBlockTwo(days, units, type = PriceCategories.ABOVE) {
    const unitCost = type === PriceCategories.ABOVE ?
        config.prices.import.blockThree : config.prices.import.blockTwo;
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
    const unitCost = config.prices.import.blockFour;
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
    const unitCost = config.prices.import.blockFive;
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
    const unitCost = config.prices.import.blockSix;
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
    const unitCost = config.prices.import.blockSeven;
    return unitCost * units;
}

function calculateExpense(category, days, units) {
    //todo: for the moment D-1 billing category only
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
