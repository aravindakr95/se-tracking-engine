import Consumer from '../models/end-user/consumer';

export default function makeAuthList() {
  async function addConsumer(consumer) {
    return new Consumer(consumer).save();
  }

  async function findConsumerByEmail(email) {
    return Consumer.findOne(email).lean();
  }

  return Object.freeze({
    addConsumer,
    findConsumerByEmail,
  });
}
