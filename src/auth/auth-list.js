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
        try {
            return new Consumer(consumer).save();
        } catch (error) {
            console.log(error.message);
            return error;
        }
    }

    async function addConsumerOnPending(tempConsumer) {
        try {
            return new TempConsumer(tempConsumer).save();
        } catch (error) {
            console.log(error.message);
            return error;
        }
    }

    async function findConsumerOnPending(msisdn) {
        try {
            return TempConsumer.findOne(msisdn);
        } catch (error) {
            console.log(error.message);
            return error;
        }
    }

    async function removeConsumerOnPending(msisdn) {
        try {
            return TempConsumer.deleteOne(msisdn).then((data) => {
                return data;
            }).catch((error) => {
                return error;
            });
        } catch (error) {
            return error;
        }
    }

    async function findConsumerByEmail(email) {
        try {
            return Consumer.findOne(email).lean();
        } catch (error) {
            console.log(error.message);
            return error;
        }
    }
}
