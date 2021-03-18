import { Schema, model } from 'mongoose';

const SummaryLogSchema = Schema;

const summaryLogSchema = new SummaryLogSchema({
  timestamp: {
    type: Number,
  },
  summaryDate: {
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

const SummaryLog = model('SummaryLog', summaryLogSchema, 'summary-logs');

export default SummaryLog;
