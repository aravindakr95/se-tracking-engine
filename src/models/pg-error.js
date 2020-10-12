import mongoose from 'mongoose';

const PgErrorSchema = mongoose.Schema;

let pgErrorSchema = PgErrorSchema({
    timestamp: {
        type: Number,
        default: new Date().getTime()
    },
    deviceId: {
        type: String, //todo: how to make this unique
        required: true
    },
    error: {
        type: String,
        required: true
    },
    rssi: {
        type: Number,
        required: true
    },
    wifiFailCount: {
        type: Number,
        required: true,
        default: 0
    },
    httpFailCount: {
        type: Number,
        required: true,
        default: 0
    }
});

let pgError = mongoose.model('PGError', pgErrorSchema, 'pg-errors');

module.exports = pgError;
