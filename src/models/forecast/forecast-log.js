import { Schema, model } from 'mongoose';

const ForecastLogSchema = Schema;

const forecastLogSchema = new ForecastLogSchema({
  timestamp: {
    type: Number,
  },
  forecastPeriod: {
    type: String,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    required: true,
  },
}, {
  timestamps: { currentTime: () => Date.now(), createdAt: 'timestamp', updatedAt: false },
});

const ForecastLog = model('ForecastLog', forecastLogSchema, 'forecast-logs');

export default ForecastLog;
