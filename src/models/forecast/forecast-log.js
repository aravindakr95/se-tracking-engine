import mongoose from 'mongoose';

const ForecastLogSchema = mongoose.Schema;

let forecastLogSchema = ForecastLogSchema({
    timestamp: {
        type: Number,
        default: Date.now
    },
    forecastPeriod: {
        type: String,
        required: true
    },
    isCompleted: {
        type: Boolean,
        required: true
    }
});

let forecastLog = mongoose.model('ForecastLog', forecastLogSchema, 'forecast-logs');

module.exports = forecastLog;
