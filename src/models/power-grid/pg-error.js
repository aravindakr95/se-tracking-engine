import mongoose from 'mongoose';

const PGErrorSchema = mongoose.Schema;

let pgErrorSchema = new PGErrorSchema({
    timestamp: {
        type: Number
    },
    deviceId: {
        type: String,
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
        required: true
    },
    httpFailCount: {
        type: Number,
        required: true
    }
}, {
    timestamps: { currentTime: () => Date.now(), createdAt: 'timestamp', updatedAt: false }
});

let pgError = mongoose.model('PGError', pgErrorSchema, 'pg-errors');

module.exports = pgError;
