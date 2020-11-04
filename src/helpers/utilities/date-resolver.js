function daysInPreviousMonth() {
    const date = new Date();

    date.setDate(0);
    return date.getDate();
}

function getPreviousDate() {
    const monthsArray = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];
    const date = new Date();
    date.setDate(0);

    return {
        dateInstance: date,
        month: monthsArray[date.getMonth()],
        year: date.getFullYear()
    };
}

function dateComparePG(objectOne, objectTwo) {
    const startingDate = new Date();
    const endingDate = new Date();

    let prevMonth = startingDate.getMonth() - 1;

    if (prevMonth < 0) {
        prevMonth += 12;
        startingDate.setFullYear(startingDate.getFullYear() - 1);
    }

    startingDate.setMonth(prevMonth);
    startingDate.setDate(1);

    endingDate.setMonth(prevMonth);
    endingDate.setDate(daysInPreviousMonth())

    const startingMillis = startingDate.setHours(0, 0, 0, 1);
    const endingMillis = endingDate.setHours(23, 59, 59, 999);

    if ((objectOne.timestamp >= startingMillis && objectOne.timestamp <= endingMillis) &&
        (objectTwo.timestamp >= startingMillis && objectTwo.timestamp <= endingMillis)) {
        return objectOne.timestamp - objectTwo.timestamp;
    }
}

function dateComparePV(objectOne, objectTwo) {
    const startingDate = new Date();
    const endingDate = new Date();

    let prevMonth = startingDate.getMonth() - 1;

    if (prevMonth < 0) {
        prevMonth += 12;
        startingDate.setFullYear(startingDate.getFullYear() - 1);
    }

    startingDate.setMonth(prevMonth);
    startingDate.setDate(1);

    endingDate.setMonth(prevMonth);
    startingDate.setDate(daysInPreviousMonth());

    const startingMillis = startingDate.setHours(0, 0, 0, 1);
    const endingMillis = endingDate.setHours(23, 59, 59, 999);

    if ((objectOne.snapshotTimestamp >= startingMillis && objectOne.snapshotTimestamp <= endingMillis) &&
        (objectTwo.snapshotTimestamp >= startingMillis && objectTwo.snapshotTimestamp <= endingMillis)) {
        return objectOne.snapshotTimestamp - objectTwo.snapshotTimestamp;
    }
}

module.exports = { daysInPreviousMonth, getPreviousDate, dateComparePG, dateComparePV };
