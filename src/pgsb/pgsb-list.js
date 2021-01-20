import PGStat from '../models/power-grid/pg-stat';
import PGError from '../models/power-grid/pg-error';

export default function makePGSBList() {
    return Object.freeze({
        addPGStats,
        findAllPGStatsByDeviceIds,
        findLatestOldestPGStatsByDeviceIds,
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

    async function findLatestOldestPGStatsByDeviceIds(deviceIds, startTime, endTime) {
        return PGStat.aggregate([
            {
                $match: {
                    deviceId: { $in: deviceIds },
                    timestamp: { $lte: endTime, $gte: startTime }
                }
            },
            { $sort: { timestamp: -1 } },
            {
                $facet: {
                    latest: [
                        {
                            $group: {
                                _id: '$slaveId',
                                result: { $first: '$$ROOT' }
                            }
                        },
                        { $limit: 2 }
                    ],
                    oldest: [
                        {
                            $group: {
                                _id: '$slaveId',
                                result: { $last: '$$ROOT' }
                            }
                        },
                        { $limit: 2 }
                    ]
                }
            }
        ]).allowDiskUse(true);
    }

    async function findLatestPGStatByDeviceIds(deviceIds, limit = 2) {
        return PGStat.aggregate([
            {
                $match: {
                    deviceId: { $in: deviceIds }
                }
            },
            { $sort: { timestamp: -1 } },
            {
                $facet: {
                    latest: [
                        {
                            $group: {
                                _id: '$slaveId',
                                result: { $first: '$$ROOT' }
                            }
                        },
                        { $limit: limit }
                    ]
                }
            }
        ]).allowDiskUse(true);
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
