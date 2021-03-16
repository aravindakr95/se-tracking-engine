import Report from '../models/analytics/report';
import ReportLog from '../models/analytics/report-log';

export default function makeAnalysisList() {
  async function addReport(record) {
    return new Report(record).save();
  }

  async function findAllReports() {
    return Report.find();
  }

  async function findReportsByAccNumber(accNumber) {
    return Report.find(accNumber).lean();
  }

  async function findReportsForYear(accountNumber, year) {
    return Report.find({ accountNumber, year }).lean();
  }

  async function findReportForMonth(accountNumber, year, month) {
    return Report.findOne({ accountNumber, year, month }).lean();
  }

  async function findAllReportsForMonth(period) {
    return Report.find(period).lean();
  }

  async function findReportByInvoiceID(id) {
    return Report.find(id);
  }

  async function addReportLog(log) {
    return new ReportLog(log).save();
  }

  async function findReportLog(period) {
    return ReportLog.findOne(period);
  }

  return Object.freeze({
    addReport,
    findAllReports,
    findReportsByAccNumber,
    findReportsForYear,
    findReportForMonth,
    findAllReportsForMonth,
    findReportByInvoiceID,
    addReportLog,
    findReportLog,
  });
}
