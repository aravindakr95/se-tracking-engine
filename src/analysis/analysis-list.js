import Report from '../models/analytics/report';
import ReportLog from '../models/analytics/report-log';

export default function makeAnalysisList() {
    return Object.freeze({
        addReport,
        findAllReports,
        findReportsByAccNumber,
        findReportsForYear,
        findReportForMonth,
        addReportLog,
        findReportLog
    });

    async function addReport(record) {
        try {
            return new Report(record).save();
        } catch (error) {
            console.log(error.message);
            return error;
        }
    }

    async function findAllReports() {
        try {
            return Report.find().then((data) => {
                return data;
            }).catch((error) => {
                return error;
            });
        } catch (error) {
            return error;
        }
    }

    async function findReportsByAccNumber(accNumber) {
        try {
            return Report.find(accNumber).lean(true).then((data) => {
                return data;
            }).catch((error) => {
                return error;
            });
        } catch (error) {
            return error;
        }
    }

    async function findReportsForYear(accountNumber, year) {
        try {
            return Report.find({ accountNumber, year }).lean(true).then((data) => {
                return data;
            }).catch((error) => {
                return error;
            });
        } catch (error) {
            return error;
        }
    }

    async function findReportForMonth(accountNumber, year, month) {
        try {
            return Report.findOne({ accountNumber, year, month }).lean(true).then((data) => {
                return data;
            }).catch((error) => {
                return error;
            });
        } catch (error) {
            return error;
        }
    }

    async function addReportLog(log) {
        try {
            return new ReportLog(log).save();
        } catch (error) {
            console.log(error.message);
            return error;
        }
    }

    async function findReportLog(month, year) {
        try {
            return ReportLog.findOne({ month, year });
        } catch (error) {
            console.log(error.message);
            return error;
        }
    }
}
