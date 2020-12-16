import { makeTwoDecimalNumber } from '../utilities/number-resolver';


function getAvgValues(reports, endDate) {
    let totalValues = 0;

    if (reports || !reports.length) {
        return {
            timestamp: endDate.getTime(),
            value: makeTwoDecimalNumber(0)
        };
    }

    reports.map((report) => {
        totalValues = totalValues + report.netAmount;
    });

    return {
        timestamp: endDate.getTime(),
        value: makeTwoDecimalNumber(totalValues / reports.length)
    };
}

module.exports = { getAvgValues };
