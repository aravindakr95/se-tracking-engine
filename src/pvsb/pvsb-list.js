import PVStat from '../models/photo-voltaic/pv-stat';

import config from '../config/config';

export default function makePVSBList() {
    return Object.freeze({
        addPVStats,
        findAllPVStatsByAccountNumber,
        mapPayload
    });

    async function addPVStats(stats) {
        return await new PVStat(stats).save();
    }

    async function findAllPVStatsByAccountNumber(accountNumber) {
        return PVStat.find(accountNumber).lean();
    }

    function mapPayload(pvStats, accountNumber) {
        const { results, success } = pvStats;
        const customPayload = {};
        const ssTimestamp = new Date(results['TIME'] + config.timezone).getTime();

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
