function calculateIncome(user, bfUnits) {
    const date = new Date();
    const establishedDuration = date.getFullYear() - user.establishedYear;

    if (establishedDuration <= 7 && establishedDuration > 0) {
        return user.tariff === 'NetMetering' ? 0 : bfUnits * 22.00;
    } else {
        return user.tariff === 'NetMetering' ? 0 : bfUnits * 15.50;
    }
}

function calculateExpense(category, units) {
    if (category !== 'D-1') {
        return 0;
    }

    if (units <= 60) {
        if (units <= 30 && units > 0) {
            return 30 + (2.50 * units);
        }

        if (units > 30 && units <= 60) {
            return 60 + (4.85 * units);
        }
    }

    if (units > 60) {
        if (units <= 61 && units > 0) {
            return (7.85 * units); // no fixed charge
        }

        if (units > 60 && units <= 90) {
            return 90 + (10 * units);
        }

        if (units > 90 && units <= 120) {
            return 480 + (27.75 * units);
        }

        if (units > 120 && units <= 180) {
            return 480 + (32.00 * units);
        }

        if (units > 180) {
            return 540 + (45 * units);
        }
    }
}

module.exports = { calculateIncome, calculateExpense };
