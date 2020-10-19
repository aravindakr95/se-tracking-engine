import mongoose from 'mongoose';

const OperatorSchema = mongoose.Schema;

let operatorSchema = OperatorSchema({
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
    empNo: {
        type: Number,
        required: true,
        unique: true
    }
});

let Operator = mongoose.model('Operator', operatorSchema, 'operators');

module.exports = Operator;
