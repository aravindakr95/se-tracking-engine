import mongoose from 'mongoose';

const ReportLogSchema = mongoose.Schema;

let reportLogSchema = ReportLogSchema({
    timestamp: {
        type: Number,
        default: new Date().getTime()
    },
    year: {
      type: Number,
      required: true
    },
    month: {
        type: Number,
        required: true
    },
    isCompleted: {
        type: Boolean,
        required: true
    }
});

let reportLog = mongoose.model('ReportLog', reportLogSchema, 'report-logs');

module.exports = reportLog;
