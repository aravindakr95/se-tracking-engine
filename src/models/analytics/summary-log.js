import mongoose from 'mongoose';

const SummaryLogSchema = mongoose.Schema;

let summaryLogSchema = new SummaryLogSchema({
    timestamp: {
        type: Number
    },
    summaryDate: {
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

let summaryLog = mongoose.model('SummaryLog', summaryLogSchema, 'summary-logs');

module.exports = summaryLog;
