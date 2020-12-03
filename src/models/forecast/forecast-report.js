import mongoose from 'mongoose';

const ForecastReportSchema = mongoose.Schema;

let forecastLogSchema = ForecastReportSchema({
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
    Forecast: {
        Predictions: {
            mean: [
                {
                    _id: false,
                    Timestamp: {
                        type: String,
                        required: true
                    },
                    Value: {
                        type: String,
                        required: true
                    }
                }
            ]
        }
    }
});

let forecastReport = mongoose.model('ForecastReport', forecastLogSchema, 'forecast-reports');

module.exports = forecastReport;
