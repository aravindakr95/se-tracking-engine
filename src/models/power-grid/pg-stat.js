import mongoose from 'mongoose';

const PgStatSchema = mongoose.Schema;

let powerGridStatSchema = PgStatSchema({
    timestamp: {
        type: Number,
        default: new Date().getTime()
    },
    deviceId: {
        type: String,
        required: true
    },
    slaveId: {
        type: String,
        required: true
    },
    currentRound: {
        type: Number,
        required: true
    },
    current: {
        type: Number,
        required: true
    },
    voltage: {
        type: Number,
        required: true
    },
    power: {
        type: Number,
        required: true
    },
    frequency: {
        type: Number,
        required: true
    },
    totalPower: {
        type: Number,
        required: true
    },
    importPower: {
        type: Number,
        required: true
    },
    exportPower: {
        type: Number,
        required: true
    },
    powerFactor: {
        type: Number,
        required: true
    },
    rssi: {
        type: Number,
        required: true
    }
});

let pgStat = mongoose.model('PGStat', powerGridStatSchema, 'pg-stats');

module.exports = pgStat;
