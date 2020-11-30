import mongoose from 'mongoose';

const PvErrorSchema = mongoose.Schema;

let pvErrorSchema = PvErrorSchema({
    timestamp: {
        type: Number,
        default: Date.now
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
        required: true,
        default: 0
    },
    httpFailCount: {
        type: Number,
        required: true,
        default: 0
    }
});

let pvError = mongoose.model('PVError', pvErrorSchema, 'pv-errors');

module.exports = pvError;
