import mongoose from 'mongoose';
import config from '../../config/config';

const ReportSchema = mongoose.Schema;

const date = new Date();

date.setDate(0);
const dueDate = new Date(date.getTime() + 12096e5); // 12096e5 = 14 days (magic number programming)

let reportSchema = ReportSchema({
    timestamp: {
        type: Number,
        default: date.getTime()
    },
    dueDate: {
        type: String,
        default: `${dueDate.getMonth() + '-' + dueDate.getDate() + '-' + dueDate.getFullYear()}` //todo: add dateStringResolver(date)
    },
    supplier: {
        type: String,
        default: config.supplier
    },
    currency: {
        type: String,
        default: config.currency
    },
    tariff: {
        type: String,
        required: true,
        enum: ['NetMetering', 'NetAccounting']
    },
    accountNumber: {
        type: Number,
        required: true,
        minlength: 10,
        maxlength: 10
    },
    contactNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    billingCategory: {
        type: String,
        required: true,
        enum: ['D-1']
    },
    billingDuration: {
        type: Number,
        required: true,
        enum: [28, 29, 30, 31]
    },
    billingPeriod: {
        type: String,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    avgDailyProduction: {
        type: Number,
        required: true
    },
    avgDailyConsumption: {
        type: Number,
        required: true
    },
    totalProduction: {
        type: Number,
        required: true
    },
    totalConsumption: {
        type: Number,
        required: true
    },
    totalGridImported: {
        type: Number,
        required: true
    },
    bfUnits: {
        type: Number,
        required: true
    },
    yield: {
        type: Number,
        required: true
    },
    grossAmount: {
        type: Number,
        default: 0.00
    },
    fixedCharge: {
        type: Number,
        default: 0.00
    },
    netAmount: {
        type: Number,
        default: 0.00
    },
    previousDue: {
        type: Number,
        default: 0.00
    },
    forecastedPayable: {
        type: Number,
        required: true
    }
});

let report = mongoose.model('Report', reportSchema, 'reports');

module.exports = report;
