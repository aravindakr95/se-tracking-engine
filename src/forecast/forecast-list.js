import ForecastReport from '../models/forecast/forecast-report';
import ForecastLog from '../models/forecast/forecast-log';

export default function makeForecastList() {
    return Object.freeze({
        addForecastReport,
        addForecastLog,
        findForecastReportByAccountNumber,
        findForecastLog
    });

    async function addForecastReport(data) {
        return await new ForecastReport(data).save();
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
