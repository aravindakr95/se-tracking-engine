import mongoose from 'mongoose';

const PVStatSchema = mongoose.Schema;

let pvStatSchema = PVStatSchema({
    timestamp: {
        type: Number,
        default: new Date().getTime()
    },
    snapshotTimestamp: {
        type: Number,
        default: null
    },
    deviceId: {
        type: String,
        required: true
    },
    load: {
        type: Number,
        required: true
    },
    pv: {
        type: Number,
        required: true
    },
    energyToday: {
        type: Number,
        required: true
    },
    totalEnergy: {
        type: Number,
        required: true
    },
    importEnergy: {
        type: Number,
        required: true
    },
    batteryCapacity: {
        type: Number,
        required: true
    },
    chargeCapacity: {
        type: Number,
        required: true
    },
    inverterTemp: {
        type: Number,
        required: true
    },
    batType: {
        type: Number, // 1 LI-ION, 2 LEAD-ACID
        required: true
    },
    batteryStatus: {
        type: Boolean,
        required: true
    },
    factoryName: {
        type: String,
        required: true
    },
    inverterModel: {
        type: String,
        required: true
    },
    inverterSN: {
        type: String,
        required: true
    }
});

let pvStat = mongoose.model('PVStat', pvStatSchema, 'pv-stats');

module.exports = pvStat;
