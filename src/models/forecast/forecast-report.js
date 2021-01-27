import mongoose from 'mongoose';

const ForecastReportSchema = mongoose.Schema;

let forecastLogSchema = ForecastReportSchema({
    timestamp: {
        type: Number,
        default: Date.now
    },
    accountNumber: {
        type: Number,
        required: true,
        minlength: 10,
        maxlength: 10
    },
    forecastPeriod: {
        type: String,
        required: true
    },
    endDate: {
        type: Number,
        required: true
    },
    value: {
        type: Number,
        required: true
    }
});

let forecastReport = mongoose.model('ForecastReport', forecastLogSchema, 'forecast-reports');

module.exports = forecastReport;
