import Consumer from '../models/end-user/consumer';
import TempConsumer from '../models/end-user/temp-consumer';

export default function makeAuthList() {
    return Object.freeze({
        addConsumer,
        addConsumerOnPending,
        findConsumerOnPending,
        removeConsumerOnPending,
        findConsumerByEmail
    });

    async function addConsumer(consumer) {
        return await new Consumer(consumer).save();
    }

    async function addConsumerOnPending(tempConsumer) {
        return await new TempConsumer(tempConsumer).save();
    }

    async function findConsumerOnPending(msisdn) {
        return TempConsumer.findOne(msisdn);
    }

    async function removeConsumerOnPending(msisdn) {
        return await TempConsumer.deleteOne(msisdn);
    }

    async function findConsumerByEmail(email) {
        return await Consumer.findOne(email).lean();
    }
}
