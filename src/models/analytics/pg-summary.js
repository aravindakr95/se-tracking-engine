import mongoose from 'mongoose';

const PGSummarySchema = mongoose.Schema;

let pgSummarySchema = new PGSummarySchema({
    timestamp: {
        type: Number
    },
    accountNumber: {
        type: Number,
        required: true,
        minlength: 10,
        maxlength: 10
    },
    year: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    day: {
        type: Number,
        required: true
    },
    summaryDate: {
        type: String,
        required: true
    },
    consumptionToday: {
        type: Number,
        required: true
    }
}, {
    timestamps: { currentTime: () => Date.now(), createdAt: 'timestamp', updatedAt: false }
});

let pgSummary = mongoose.model('PGSummary', pgSummarySchema, 'pg-summaries');

module.exports = pgSummary;
