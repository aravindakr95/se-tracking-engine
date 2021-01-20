import mongoose from 'mongoose';

const SummaryLogSchema = mongoose.Schema;

let summaryLogSchema = SummaryLogSchema({
    timestamp: {
        type: Number,
        default: Date.now()
    },
    summaryDate: {
        type: String,
        required: true
    },
    isCompleted: {
        type: Boolean,
        required: true
    }
});

let summaryLog = mongoose.model('SummaryLog', summaryLogSchema, 'summary-logs');

module.exports = summaryLog;
