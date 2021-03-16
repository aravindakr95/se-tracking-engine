import PVSummary from '../models/analytics/pv-summary';
import PGSummary from '../models/analytics/pg-summary';
import SummaryLog from '../models/analytics/summary-log';

export default function makeSummaryList() {
    return Object.freeze({
        addPVSummary,
        addPGSummary,
        addSummaryLog,
        findPVSummary,
        findPGSummary,
        findSummaryLog
    });

    async function addPVSummary(data) {
        return await new PVSummary(data).save();
    }

    async function addPGSummary(data) {
        return await new PGSummary(data).save();
    }

    async function addSummaryLog(log) {
        return await new SummaryLog(log).save();
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
}
