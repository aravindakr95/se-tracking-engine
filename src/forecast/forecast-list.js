import ForecastReport from '../models/forecast/forecast-report';
import ForecastLog from '../models/forecast/forecast-log';

import { getAvgValues } from '../helpers/forecast/forecast-engine';

export default function makeForecastList() {
    return Object.freeze({
        addForecastReport,
        addForecastLog,
        findForecastReportByAccountNumber,
        findForecastLog
    });

    async function addForecastReport(reports, endDate, forecastPeriod, accountNumber, prediction = null) {
        let result = null;

        if (prediction) {
            result = Object.assign(prediction, forecastPeriod, accountNumber);
        } else {
            const average = getAvgValues(reports, endDate);
            result = Object.assign({}, average, forecastPeriod, accountNumber);
        }

        return await new ForecastReport(result).save();
    }

    async function addForecastLog(log) {
        return await new ForecastLog(log).save();
    }

    async function findForecastReportByAccountNumber(accountNumber, forecastPeriod) {
        return ForecastReport.findOne({ accountNumber, forecastPeriod }).lean();
    }

    async function findForecastLog(forecastPeriod) {
        return ForecastLog.findOne(forecastPeriod);
    }
}
