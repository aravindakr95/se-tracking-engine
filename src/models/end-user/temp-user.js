import mongoose from 'mongoose';

const TempUserSchema = mongoose.Schema;

let tempUserSchema = TempUserSchema({
    timestamp: {
        type: Number,
        default: new Date().getTime()
    },
    msisdn: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    serverRef: {
        type: String,
        required: true
    }
});

let TempUser = mongoose.model('TempUser', tempUserSchema, 'temp-users');

module.exports = TempUser;
