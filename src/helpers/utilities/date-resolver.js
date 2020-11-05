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

function dateComparePG(objectOne, objectTwo) {
    const startingDate = new Date();
    const endingDate = new Date();

    startingDate.setDate(0);
    startingDate.setDate(1);

    endingDate.setDate(daysInPreviousMonth());

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

    startingDate.setDate(0);
    startingDate.setDate(1);

    startingDate.setDate(daysInPreviousMonth());

    const startingMillis = startingDate.setHours(0, 0, 0, 1);
    const endingMillis = endingDate.setHours(23, 59, 59, 999);

    if ((objectOne.snapshotTimestamp >= startingMillis && objectOne.snapshotTimestamp <= endingMillis) &&
        (objectTwo.snapshotTimestamp >= startingMillis && objectTwo.snapshotTimestamp <= endingMillis)) {
        return objectOne.snapshotTimestamp - objectTwo.snapshotTimestamp;
    }
}

module.exports = { daysInPreviousMonth, getPreviousDate, dateComparePG, dateComparePV };
