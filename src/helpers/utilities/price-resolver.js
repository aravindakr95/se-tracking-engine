function calculateIncome(dateTime, consumer, bfUnits) {
    const establishedDuration = dateTime.getFullYear() - consumer.establishedYear;

    if (establishedDuration <= 7 && establishedDuration > 0) {
        return consumer.tariff === 'Net Metering' ? 0 : bfUnits * 22.00;
    } else {
        return consumer.tariff === 'Net Metering' ? 0 : bfUnits * 15.50;
    }
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

    if (units <= 60) {
        if (units <= 30 && units > 0) {
            return {
                fixedCharge: 30,
                grossAmount: (2.50 * units),
                netAmount: 30 +  (2.50 * units)
            };
        }

        if (units > 30 && units <= 60) {
            return {
                fixedCharge: 60,
                grossAmount: (4.85 * units),
                netAmount: 60 +  (4.85 * units)
            };
        }
    }

    if (units > 60) {
        if (units <= 61 && units > 0) {
            return {
                fixedCharge: 0,
                grossAmount: (7.85 * units) ,
                netAmount: (7.85 * units)
            }; // no fixed charge
        }

        if (units > 60 && units <= 90) {
            return {
                fixedCharge: 90,
                grossAmount: (10 * units),
                netAmount: 90 +  (10 * units)
            };
        }

        if (units > 90 && units <= 120) {
            return {
                fixedCharge: 480,
                grossAmount: (27.75 * units),
                netAmount: 480 +  (27.75 * units)
            };
        }

        if (units > 120 && units <= 180) {
            return {
                fixedCharge: 480,
                grossAmount: (32.00 * units),
                netAmount: 480 +  (32.00 * units)
            };
        }

        if (units > 180) {
            return {
                fixedCharge: 540,
                grossAmount: (45 * units) ,
                netAmount: 540 +  (45 * units)
            };
        }
    }
}

module.exports = { calculateIncome, calculateExpense };
