import makeTwoDecimalNumber from '../utilities/number-resolver';

function getAvgValues(reports, endDate) {
  let totalValues = 0;

  if (reports || !reports.length) {
    return {
      endDate: endDate.getTime(),
      value: makeTwoDecimalNumber(0),
    };
  }

  reports.map((report) => {
    totalValues += report.netAmount;
  });

  return {
    endDate: endDate.getTime(),
    value: makeTwoDecimalNumber(totalValues / reports.length),
  };
}

export default getAvgValues;
