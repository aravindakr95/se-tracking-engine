import { Schema, model } from 'mongoose';

const PGErrorSchema = Schema;

const pgErrorSchema = new PGErrorSchema({
  timestamp: {
    type: Number,
  },
  deviceId: {
    type: String,
    required: true,
  },
  error: {
    type: String,
    required: true,
  },
  rssi: {
    type: Number,
    required: true,
  },
  wifiFailCount: {
    type: Number,
    required: true,
  },
  httpFailCount: {
    type: Number,
    required: true,
  },
}, {
  timestamps: { currentTime: () => Date.now(), createdAt: 'timestamp', updatedAt: false },
});

const PGError = model('PGError', pgErrorSchema, 'pg-errors');

export default PGError;
