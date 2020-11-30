import mongoose from 'mongoose';

const TempConsumerSchema = mongoose.Schema;

let tempConsumerSchema = TempConsumerSchema({
    timestamp: {
        type: Number,
        default: Date.now
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

let TempConsumer = mongoose.model('TempConsumer', tempConsumerSchema, 'temp-consumers');

module.exports = TempConsumer;
