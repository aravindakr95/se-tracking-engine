import PGStat from '../models/pg-stat';
import PGError from '../models/pg-error';

export default function makePGSBList() {
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

    async function addPGErrors(error) {
        try {
            return new PGError(error).save();
        } catch (error) {
            console.log(error.message);
            return error;
        }
    }
}
