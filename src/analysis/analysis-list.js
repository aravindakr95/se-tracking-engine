import Report from '../models/analytics/report';
import ReportLog from '../models/analytics/report-log';

export default function makeAnalysisList() {
    return Object.freeze({
        addReport,
        findAllReports,
        findReportsByAccNumber,
        findReportsForYear,
        findReportForMonth,
        findAllReportsForMonth,
        findReportByInvoiceID,
        addReportLog,
        findReportLog
    });

    async function addReport(record) {
        return await new Report(record).save();
    }

    async function findAllReports() {
        return await Report.find();
    }

    async function findReportsByAccNumber(accNumber) {
        return await Report.find(accNumber).lean();
    }

    async function findReportsForYear(accountNumber, year) {
        return await Report.find({ accountNumber, year }).lean();
    }

    async function findReportForMonth(accountNumber, year, month) {
        return await Report.findOne({ accountNumber, year, month }).lean();
    }

    async function findAllReportsForMonth(period) {
        return await Report.find(period).lean();
    }

    async function findReportByInvoiceID(id) {
        return await Report.find(id);
    }

    async function addReportLog(log) {
        return await new ReportLog(log).save();
    }

    async function findReportLog(period) {
        return ReportLog.findOne(period);
    }
}
