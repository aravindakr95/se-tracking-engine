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
    subscribers: [
        {
            _id: false,
            holder: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true,
                lowercase: true
            }
        }
    ],
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
        default: 'ACTIVE',
        enum: ['INACTIVE', 'ACTIVE']
    },
    devices: [
        {
            _id: false,
            floor: {
                type: String,
                required: true,
                enum: ['Ground Floor', 'First Floor', 'Second Floor']
            },
            description: {
                type: String,
                default: ''
            },
            deviceId: {
                type: String,
                required: true
            },
            slaveId: {
                type: Number,
                default: null
            }
        }
    ]
});

let Consumer = mongoose.model('Consumer', consumerSchema, 'consumers');

module.exports = Consumer;
