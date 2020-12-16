import Consumer from '../models/end-user/consumer';

export default function makeAuthList() {
    return Object.freeze({
        addConsumer,
        findConsumerByEmail
    });

    async function addConsumer(consumer) {
        return await new Consumer(consumer).save();
    }

    async function findConsumerByEmail(email) {
        return Consumer.findOne(email).lean();
    }
}
