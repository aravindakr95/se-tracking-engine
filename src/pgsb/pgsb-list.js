import PGStat from '../models/power-grid/pg-stat';
import PGError from '../models/power-grid/pg-error';

export default function makePGSBList() {
    return Object.freeze({
        addPGStats,
        findAllPGStatsByDeviceId,
        addPGError
    });

    async function addPGStats(stats) {
        return await new PGStat(stats).save();
    }

    async function findAllPGStatsByDeviceId(deviceId) {
        return await PGStat.find(deviceId).lean();
    }

    async function addPGError(error) {
        return await new PGError(error).save();
    }
}
