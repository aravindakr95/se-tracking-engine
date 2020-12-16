import Consumer from '../models/end-user/consumer';
import AccountStatus from '../models/common/account-status';

export default function makeConsumerList() {
    return Object.freeze({
        getAllConsumers,
        findConsumersByStatus,
        findConsumerByAccNumber,
        findConsumerByDeviceId,
        findDeviceIdsByAccNumber,
        updateConsumerByAccNumber,
        deleteConsumerByAccNumber
    });

    async function getAllConsumers() {
        return Consumer.find();
    }

    async function findConsumersByStatus(status) {
        return Consumer.find(status);
    }

    async function findConsumerByAccNumber(accNumber) {
        return Consumer.findOne({
            accountNumber: accNumber,
            status: AccountStatus.ACTIVE
        }).lean();
    }

    async function findConsumerByDeviceId(deviceId) {
        return Consumer.findOne({
            'devices.deviceId': deviceId,
            'status': AccountStatus.ACTIVE
        });
    }

    async function findDeviceIdsByAccNumber(accNumber) {
        try {
            const consumer = await findConsumerByAccNumber(accNumber);

            if (consumer && consumer.devices) {
                return consumer.devices.map(device => device.deviceId);
            } else {
                return null;
            }
        } catch (error) {
            return error;
        }
    }

    async function updateConsumerByAccNumber(accNumber, data) {
        return Consumer.findOneAndUpdate(
            accNumber,
            data,
            { new: true }
        );
    }

    async function deleteConsumerByAccNumber(accNumber) {
        return Consumer.deleteOne(accNumber);
    }
}
