import mongoose from 'mongoose';

const PGSummarySchema = mongoose.Schema;

let pgSummarySchema = PGSummarySchema({
    timestamp: {
        type: Number,
        default: Date.now()
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
});

let pgSummary = mongoose.model('PGSummary', pgSummarySchema, 'pg-summaries');

module.exports = pgSummary;
