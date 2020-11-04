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
        type: String,
        required: true,
        enum: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ]
    },
    isCompleted: {
        type: Boolean,
        required: true
    }
});

let reportLog = mongoose.model('ReportLog', reportLogSchema, 'report-logs');

module.exports = reportLog;
