import mongoose from 'mongoose';

const ReportSchema = mongoose.Schema;

let reportSchema = ReportSchema({
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
        minlength: 1,
        maxlength: 12
    },
    year: {
        type: String,
        required: true
    },
    avgDailyProduction: {
        type: Number,
        required: true
    },
    avgDailyConsumption: {
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
    totalGridImported: {
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

let report = mongoose.model('Report', reportSchema, 'reports');

module.exports = report;
