import mongoose from 'mongoose';

const ReportLogSchema = mongoose.Schema;

let reportLogSchema = new ReportLogSchema({
    timestamp: {
        type: Number
    },
    billingPeriod: {
        type: String,
        required: true
    },
    isCompleted: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: { currentTime: () => Date.now(), createdAt: 'timestamp', updatedAt: false }
});

let reportLog = mongoose.model('ReportLog', reportLogSchema, 'report-logs');

module.exports = reportLog;
