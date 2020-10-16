import PGStat from '../models/pg-stat';
import PGError from '../models/pg-error';

export default function makePGSBList() {
    return Object.freeze({
        addPGStats,
        findAllPGStatsByDeviceId,
        addPGError
    });

    async function addPGStats(stats) {
        try {
            return new PGStat(stats).save();
        } catch (error) {
            console.log(error.message);
            return error;
        }
    }

    async function findAllPGStatsByDeviceId(deviceId) {
        try {
            return PGStat.find(deviceId).lean(true).then((data) => {
                return data;
            }).catch((error) => {
                return error;
            });
        } catch (error) {
            return error;
        }
    }

    async function addPGError(error) {
        try {
            return new PGError(error).save();
        } catch (error) {
            console.log(error.message);
            return error;
        }
    }
}
