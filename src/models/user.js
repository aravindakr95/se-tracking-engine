import mongoose from 'mongoose';

const UserSchema = mongoose.Schema;

let userSchema = UserSchema({
    timestamp: {
        type: Number,
        default: new Date().getTime()
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
        required: true,
        enum: ['CEB', 'LECO']
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

let User = mongoose.model('User', userSchema, 'users');

module.exports = User;
