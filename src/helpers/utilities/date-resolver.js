const startingDateTime = new Date();
const endingDateTime = new Date();

function daysInMonth() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    return  new Date(year, month, 0).getDate();
}

function dateComparePG(objectOne, objectTwo) {
    startingDateTime.setDate(1);
    endingDateTime.setDate(daysInMonth());

    const startingMillis = startingDateTime.setHours(0, 0, 0, 0);
    const endingMillis = endingDateTime.setHours(23, 59, 59, 999);

    if ((objectOne.timestamp >= startingMillis && objectOne.timestamp <= endingMillis) &&
        (objectTwo.timestamp >= startingMillis && objectTwo.timestamp <= endingMillis)) {
        return objectOne.timestamp - objectTwo.timestamp;
    }
}

function dateComparePV(objectOne, objectTwo) {
    startingDateTime.setDate(1);
    endingDateTime.setDate(daysInMonth());

    const startingMillis = startingDateTime.setHours(0, 0, 0, 0);
    const endingMillis = endingDateTime.setHours(23, 59, 59, 999);

    if ((objectOne.snapshotTimestamp >= startingMillis && objectOne.snapshotTimestamp <= endingMillis) &&
        (objectTwo.snapshotTimestamp >= startingMillis && objectTwo.snapshotTimestamp <= endingMillis)) {
        return objectOne.snapshotTimestamp - objectTwo.snapshotTimestamp;
    }
}

module.exports = { daysInMonth, dateComparePG, dateComparePV };
