import { Schema, model } from 'mongoose';

import config from '../../config/config';

import SchemaType from '../../enums/account/schema-type';
import AccountStatus from '../../enums/account/account-status';

const ConsumerSchema = Schema;

const consumerSchema = new ConsumerSchema({
  timestamp: {
    type: Number,
  },
  deviceToken: {
    type: String,
    default: '',
  },
  establishedYear: { // connection established year (for yield check)
    type: Number,
    default: new Date().getFullYear(),
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  subscribers: [
    {
      _id: false,
      holder: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
      },
    },
  ],
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  nic: {
    type: String,
    required: true,
    unique: true,
    minlength: 10,
    maxlength: 12,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  supplier: {
    type: String,
    default: config.supplier,
  },
  billingCategory: {
    type: String,
    required: true,
    enum: ['D-1'],
  },
  tariff: {
    type: String,
    required: true,
    enum: [SchemaType.NET_METERING, SchemaType.NET_ACCOUNTING],
  },
  accountNumber: {
    type: Number,
    required: true,
    unique: true,
    minlength: 10,
    maxlength: 10,
  },
  status: {
    type: String,
    required: true,
    default: AccountStatus.ACTIVE,
    enum: [AccountStatus.ACTIVE, AccountStatus.INACTIVE],
  },
  devices: [
    {
      _id: false,
      floor: {
        type: String,
        required: true,
        enum: ['Ground Floor', 'First Floor', 'Second Floor'],
      },
      description: {
        type: String,
        default: '',
      },
      deviceId: {
        type: String,
        required: true,
      },
      slaveId: {
        type: Number,
        default: null,
      },
    },
  ],
}, {
  timestamps: { currentTime: () => Date.now(), createdAt: 'timestamp', updatedAt: false },
});

const Consumer = model('Consumer', consumerSchema, 'consumers');

export default Consumer;
