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
    accountNumber: {
        type: Number,
        required: true,
        minlength: 10,
        maxlength: 10
    },
    premiseId: {
        type: String,
        required: true
    }
});

let User = mongoose.model('User', userSchema, 'users');

module.exports = User;
