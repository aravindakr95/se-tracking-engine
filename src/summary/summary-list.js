import PVSummary from '../models/analytics/pv-summary';
import PGSummary from '../models/analytics/pg-summary';
import SummaryLog from '../models/analytics/summary-log';

export default function makeSummaryList() {
  async function addPVSummary(data) {
    return new PVSummary(data).save();
  }

  async function addPGSummary(data) {
    return new PGSummary(data).save();
  }

  async function addSummaryLog(log) {
    return new SummaryLog(log).save();
  }

  async function findPVSummary(accountNumber, year, month) {
    return PVSummary.find({ accountNumber, year, month });
  }

  async function findPGSummary(accountNumber, year, month) {
    return PGSummary.find({ accountNumber, year, month });
  }

  async function findSummaryLog(period) {
    return SummaryLog.findOne(period);
  }

  return Object.freeze({
    addPVSummary,
    addPGSummary,
    addSummaryLog,
    findPVSummary,
    findPGSummary,
    findSummaryLog,
  });
}
