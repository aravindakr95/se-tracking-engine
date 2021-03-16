import mongoose from 'mongoose';

const ForecastLogSchema = mongoose.Schema;

let forecastLogSchema = new ForecastLogSchema({
    timestamp: {
        type: Number
    },
    forecastPeriod: {
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

let forecastLog = mongoose.model('ForecastLog', forecastLogSchema, 'forecast-logs');

module.exports = forecastLog;
