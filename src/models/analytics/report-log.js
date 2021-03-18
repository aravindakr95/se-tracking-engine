import { Schema, model } from 'mongoose';

const ReportLogSchema = Schema;

const reportLogSchema = new ReportLogSchema({
  timestamp: {
    type: Number,
  },
  billingPeriod: {
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

const ReportLog = model('ReportLog', reportLogSchema, 'report-logs');

export default ReportLog;
