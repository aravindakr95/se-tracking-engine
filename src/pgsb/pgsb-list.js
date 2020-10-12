import PGStat from '../models/pg-stat';
import PGError from '../models/pg-error';

export default function makePowerGridList() {
    return Object.freeze({
        addPGStats,
        addPGErrors
    });

    async function addPGStats(stats) {
        try {
            return new PGStat(stats).save();
        } catch (error) {
            console.log(error.message);
            return error;
        }
    }

    async function addPGErrors(stats) {
        try {
            return new PGError(stats).save();
        } catch (error) {
            console.log(error.message);
            return error;
        }
    }
}
