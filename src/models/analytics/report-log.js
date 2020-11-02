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
        required: true,
        min: 1,
        max: 12
    },
    isCompleted: {
        type: Boolean,
        required: true
    }
});

let reportLog = mongoose.model('ReportLog', reportLogSchema, 'report-logs');

module.exports = reportLog;
