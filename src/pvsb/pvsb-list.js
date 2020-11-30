import PVStat from '../models/photo-voltaic/pv-stat';
import PVError from '../models/photo-voltaic/pv-error';

import config from '../config/config';

export default function makePVSBList() {
    return Object.freeze({
        addPVStats,
        addPVError,
        findAllPVStatsByDeviceId,
        mapPayload
    });

    async function addPVStats(stats) {
        return await new PVStat(stats).save();
    }

    async function addPVError(error) {
        return await new PVError(error).save();
    }

    async function findAllPVStatsByDeviceId(deviceId) {
        return await PVStat.find(deviceId).lean();
    }

    function mapPayload(deviceId, fetchMode, body) {
        const { results, success } = body;
        const customPayload = {};
        const ssTimestamp = fetchMode === 'API' ? new Date(results['TIME'] + config.timezone).getTime() : null;

        if (results && success) {
            customPayload['snapshotTimestamp'] = ssTimestamp;
            customPayload['deviceId'] = deviceId;
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
