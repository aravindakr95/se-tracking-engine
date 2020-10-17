import Report from '../models/report';

export default function makeAnalysisList() {
    return Object.freeze({
        addReport
    });

    async function addReport(record) {
        try {
            return new Report(record).save();
        } catch (error) {
            console.log(error.message);
            return error;
        }
    }
}
