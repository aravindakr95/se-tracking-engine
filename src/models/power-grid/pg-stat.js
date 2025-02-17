import { Schema, model } from 'mongoose';

const PGStatSchema = Schema;

const pgStatSchema = new PGStatSchema({
  timestamp: {
    type: Number,
  },
  deviceId: {
    type: String,
    required: true,
  },
  slaveId: {
    type: Number,
    required: true,
  },
  currentRound: {
    type: Number,
    required: true,
  },
  current: {
    type: Number,
    required: true,
  },
  voltage: {
    type: Number,
    required: true,
  },
  power: {
    type: Number,
    required: true,
  },
  frequency: {
    type: Number,
    required: true,
  },
  totalPower: {
    type: Number,
    required: true,
  },
  importPower: {
    type: Number,
    required: true,
  },
  exportPower: {
    type: Number,
    required: true,
  },
  powerFactor: {
    type: Number,
    required: true,
  },
  rssi: {
    type: Number,
    required: true,
  },
}, {
  timestamps: { currentTime: () => Date.now(), createdAt: 'timestamp', updatedAt: false },
});

const PGStat = model('PGStat', pgStatSchema, 'pg-stats');

export default PGStat;
