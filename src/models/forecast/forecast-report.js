import mongoose from 'mongoose';

const ForecastReportSchema = mongoose.Schema;

let forecastLogSchema = new ForecastReportSchema({
    timestamp: {
        type: Number
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
}, {
    timestamps: { currentTime: () => Date.now(), createdAt: 'timestamp', updatedAt: false }
});

let forecastReport = mongoose.model('ForecastReport', forecastLogSchema, 'forecast-reports');

module.exports = forecastReport;
