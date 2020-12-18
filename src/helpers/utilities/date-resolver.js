function daysInPreviousMonth() {
    const date = new Date();

    date.setDate(0);
    return date.getDate();
}

function getPreviousDate() {
    const date = new Date();
    date.setDate(0);
    date.setHours(23, 59, 59, 999);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return {
        dateInstance: date,
        billingPeriod: `${month}-${day}-${year}`,
        month,
        year
    };
}

function getLastDay(dateInstance) {
    return new Date(dateInstance.getFullYear(), dateInstance.getMonth() + 1, 0);
}

function getDateString(dateInstance) {
    return `${dateInstance.getMonth() + 1}-${dateInstance.getDate()}-${dateInstance.getFullYear()}`;
}

function getCurrentMonthString(dateInstance) {
    const date = new Date(dateInstance.getFullYear(), dateInstance.getMonth(), 1);

    return `${date.getMonth() + 1}-${date.getFullYear()}`;
}

module.exports = { daysInPreviousMonth, getPreviousDate, getLastDay, getDateString, getCurrentMonthString };
