import mongoose from 'mongoose';

const RecordSchema = mongoose.Schema;

let recordSchema = RecordSchema({
    timestamp: {
        type: Number,
        default: new Date().getTime()
    },
    accountNumber: {
        type: Number,
        required: true,
        minlength: 10,
        maxlength: 10
    },
    billingDuration: {
        type: Number,
        required: true,
        enum: [28, 29, 30, 31]
    },
    month: {
        type: String,
        required: true,
        enum: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Nov', 'Dec']
    },
    year: {
        type: String,
        required: true
    },
    avDailyProduction: {
        type: Number,
        required: true
    },
    avDailyConsumption: {
        type: Number,
        required: true
    },
    totalProduction: {
        type: Number,
        required: true
    },
    totalConsumption: {
        type: Number,
        required: true
    },
    bfUnits: {
        type: Number,
        required: true
    },
    yield: {
        type: Number,
        required: true
    },
    payableAmount: {
        type: Number,
        required: true
    }
});

let record = mongoose.model('Record', recordSchema, 'records');

module.exports = record;
