import PGStat from '../models/power-grid/pg-stat';
import PGError from '../models/power-grid/pg-error';

export default function makePGSBList() {
    return Object.freeze({
        addPGStats,
        findAllPGStatsByDeviceIds,
        findLatestPGStatByDeviceIds,
        flushPGData,
        addPGError,
        flushPGErrorData
    });

    async function addPGStats(stats) {
        return await new PGStat(stats).save();
    }

    async function findAllPGStatsByDeviceIds(deviceIds) {
        return PGStat.find({ deviceId: { $in: deviceIds } });
    }

    async function findLatestPGStatByDeviceIds(deviceIds) {
        return PGStat
            .find({ deviceId: { $in: deviceIds } })
            .sort({ timestamp: -1 })
            .limit(2);
    }

    async function addPGError(error) {
        return await new PGError(error).save();
    }

    async function flushPGData(dateMS) {
        return PGStat.deleteMany({ timestamp: { $lte: dateMS } });
    }

    async function flushPGErrorData(dateMS) {
        return PGError.deleteMany({ timestamp: { $lte: dateMS } });
    }
}
