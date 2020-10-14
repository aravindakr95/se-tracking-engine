import PVStat from '../models/pv-stat';
import PVError from '../models/pv-error';

export default function makePVSBList() {
    return Object.freeze({
        addPVStats,
        addPVError,
        mapPayload
    });

    async function addPVStats(stats) {
        try {
            return new PVStat(stats).save();
        } catch (error) {
            console.log(error.message);
            return error;
        }
    }

    async function addPVError(error) {
        try {
            return new PVError(error).save();
        } catch (error) {
            console.log(error.message);
            return error;
        }
    }

    function mapPayload(deviceId, body) {
        const { results, success } = body;
        const customPayload = {};

        if (success && results) {
            customPayload['snapshotTimestamp'] = results['TIME'];
            customPayload['deviceId'] = deviceId;
            customPayload['load'] = results['LOAD'];
            customPayload['pv'] = results['PV'];
            customPayload['energyToday'] = results['ENERGY_TODAY'];
            customPayload['totalEnergy'] = results['ENERGY_TOTAL'];
            customPayload['importEnergy'] = results['GRID'];
            customPayload['batteryCapacity'] = results['battery_capacity'];
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
