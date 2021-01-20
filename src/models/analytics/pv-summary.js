import mongoose from 'mongoose';

const PVSummarySchema = mongoose.Schema;

let pvSummarySchema = PVSummarySchema({
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
    productionToday: {
        type: Number,
        required: true
    }
});

let pvSummary = mongoose.model('PVSummary', pvSummarySchema, 'pv-summaries');

module.exports = pvSummary;
