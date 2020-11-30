import mongoose from 'mongoose';
import config from '../../config/config';

const ConsumerSchema = mongoose.Schema;

let consumerSchema = ConsumerSchema({
    timestamp: {
        type: Number,
        default: Date.now
    },
    deviceToken: {
        type: String,
        default: ''
    },
    establishedYear: { //connection established year (for yield check)
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    nic: {
        type: String,
        required: true,
        unique: true,
        minlength: 10,
        maxlength: 12
    },
    contactNumber: {
        type: String,
        required: true
    },
    supplier: {
        type: String,
        default: config.supplier
    },
    billingCategory: {
        type: String,
        required: true,
        enum: ['D-1']
    },
    tariff: {
        type: String,
        required: true,
        enum: ['Net Metering', 'Net Accounting']
    },
    accountNumber: {
        type: Number,
        required: true,
        minlength: 10,
        maxlength: 10
    },
    status: {
        type: String,
        required: true,
        default: 'INACTIVE',
        enum: ['INACTIVE', 'ACTIVE']
    },
    devices: [
        {
            _id: false,
            type: {
                type: String,
                required: true,
                enum: ['PGSB', 'PVSB']
            },
            deviceId: {
                type: String,
                required: true
            },
            slaveId: {
                type: String,
                default: null
            }
        }
    ]
});

let Consumer = mongoose.model('Consumer', consumerSchema, 'consumers');

module.exports = Consumer;
