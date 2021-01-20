import PVStat from '../models/photo-voltaic/pv-stat';

export default function makePVSBList() {
    return Object.freeze({
        addPVStats,
        findAllPVStatsByAccountNumber,
        findLatestOldestPVStatByTime,
        findLatestPVStatByAccountNumber,
        flushPVData,
        mapPayload
    });

    async function addPVStats(stats) {
        return await new PVStat(stats).save();
    }

    async function findAllPVStatsByAccountNumber(accountNumber) {
        return PVStat.find(accountNumber).lean();
    }

    async function findLatestOldestPVStatByTime(accountNumber, endTime, startTime) {
        const latestPVStat = await PVStat.findOne({
            accountNumber: accountNumber,
            snapshotTimestamp: { $lte: endTime, $gte: startTime }
        })
            .sort({ timestamp: -1 }) // latest doc
            .limit(1);

        const oldestPVStat = await PVStat.findOne({
            accountNumber: accountNumber,
            snapshotTimestamp: { $lte: endTime, $gte: startTime }
        })
            .sort({ timestamp: 1 }) // oldest doc
            .limit(1);

        return {
            latest: latestPVStat,
            oldest: oldestPVStat
        };
    }

    async function findLatestPVStatByAccountNumber(accountNumber) {
        return PVStat
            .find(accountNumber)
            .sort({ timestamp: -1 })
            .limit(1);
    }

    async function flushPVData(dateMS) {
        return PVStat.deleteMany({ snapshotTimestamp: { $lte: dateMS } });
    }

    function mapPayload(pvStats, accountNumber) {
        const { results, success } = pvStats;
        const customPayload = {};
        const ssTimestamp = new Date(results['TIME']).getTime();

        if (results && success) {
            customPayload['snapshotTimestamp'] = ssTimestamp;
            customPayload['accountNumber'] = accountNumber;
            customPayload['load'] = results['LOAD'];
            customPayload['pv'] = results['PV'];
            customPayload['energyToday'] = results['ENERGY_TODAY'];
            customPayload['totalEnergy'] = results['ENERGY_TOTAL'];
            customPayload['importEnergy'] = results['GRID'];
            customPayload['batteryCapacity'] = results['BATTERY_CAPACITY'];
            customPayload['chargeCapacity'] = results['CAPACITY_CHARGE'];
            customPayload['inverterTemp'] = results['TMP'];
            customPayload['batType'] = results['bat_type'];
            customPayload['batteryStatus'] = results['bat_type'] === 1;
            customPayload['factoryName'] = results['FACTORY_NAME_EN'];
            customPayload['inverterModel'] = results['EQUMODEL_NAME'];
            customPayload['inverterSN'] = results['INV_SN'];

            return customPayload;
        }

        return null;
    }
}
