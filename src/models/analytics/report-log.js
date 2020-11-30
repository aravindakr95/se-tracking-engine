import mongoose from 'mongoose';

const ReportLogSchema = mongoose.Schema;

let reportLogSchema = ReportLogSchema({
    timestamp: {
        type: Number,
        default: Date.now
    },
    billingPeriod: {
        type: String,
        required: true
    },
    isCompleted: {
        type: Boolean,
        required: true
    }
});

let reportLog = mongoose.model('ReportLog', reportLogSchema, 'report-logs');

module.exports = reportLog;
