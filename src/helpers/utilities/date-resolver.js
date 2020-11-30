function daysInPreviousMonth() {
    const date = Date.now;

    date.setDate(0);
    return date.getDate();
}

function getPreviousDate() {
    const date = Date.now;
    date.setDate(0);

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

function getDateString(dateInstance) {
    return `${dateInstance.getMonth() + 1}-${dateInstance.getDate()}-${dateInstance.getFullYear()}`;
}

module.exports = { daysInPreviousMonth, getPreviousDate, getDateString };
