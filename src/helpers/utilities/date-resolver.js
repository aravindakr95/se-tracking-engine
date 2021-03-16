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
    year,
  };
}

function getYesterday() {
  const yesterday = new Date(Date.now() - 864e5);

  const year = yesterday.getFullYear();
  const month = yesterday.getMonth() + 1;
  const day = yesterday.getDate();

  return {
    startTime: yesterday.setHours(0, 0, 0, 1),
    endTime: yesterday.setHours(23, 59, 59, 999),
    summaryDate: `${month}-${day}-${year}`,
    dateInstance: yesterday,
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

export {
  daysInPreviousMonth,
  getPreviousDate,
  getYesterday,
  getLastDay,
  getDateString,
  getCurrentMonthString,
};
