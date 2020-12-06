function daysInPreviousMonth() {
    const date = new Date();

    date.setDate(0);
    return date.getDate();
}

function getPreviousDate() {
    const date = new Date();
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

function getFirstDay(dateInstance) {
    return new Date(dateInstance.getFullYear(), dateInstance.getMonth() + 1, 1);
}

function getLastDay(dateInstance) {
    return new Date(dateInstance.getFullYear(), dateInstance.getMonth() + 1, 0);
}

function getDateString(dateInstance) {
    return `${dateInstance.getMonth() + 1}-${dateInstance.getDate()}-${dateInstance.getFullYear()}`;
}

function getNextMonthString(dateInstance) {
    let date = null;

    if (dateInstance.getMonth() === 11) {
        date = new Date(dateInstance.getFullYear() + 1, 0, 1);
    } else {
        date = new Date(dateInstance.getFullYear(), dateInstance.getMonth() + 1, 1);
    }

    return `${date.getMonth() + 1}-${date.getFullYear()}`;
}

module.exports = { daysInPreviousMonth, getPreviousDate, getFirstDay, getLastDay, getDateString, getNextMonthString };
