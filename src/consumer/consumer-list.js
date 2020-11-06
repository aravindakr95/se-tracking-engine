import Consumer from '../models/end-user/consumer';

export default function makeConsumerList() {
    return Object.freeze({
        getAllConsumers,
        findConsumersByStatus,
        findConsumerByAccNumber,
        findConsumerByDeviceId,
        findDeviceIdByAccNumber,
        updateConsumerByAccNumber,
        updateConsumerStatusByContactNumber,
        deleteConsumerByAccNumber
    });

    async function getAllConsumers() {
        return await Consumer.find();
    }

    async function findConsumersByStatus(status) {
        return await Consumer.find(status);
    }

    async function findConsumerByAccNumber(accNumber) {
        return await Consumer.findOne({ accountNumber: accNumber, status: 'ACTIVE' }).lean();
    }

    async function findConsumerByDeviceId(deviceId) {
        return Consumer.findOne({
            'devices.deviceId': deviceId,
            'status': 'ACTIVE'
        });
    }

    async function findDeviceIdByAccNumber(accNumber, type) {
        try {
            const consumer = await findConsumerByAccNumber(accNumber);

            if (consumer && consumer.devices) {
                const { deviceId } = consumer.devices.find(device => device.type === type);

                return deviceId;
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

    async function updateConsumerStatusByContactNumber(contactNumber, data) {
        return await Consumer.updateOne(contactNumber, data);
    }

    async function deleteConsumerByAccNumber(accNumber) {
        return await Consumer.deleteOne(accNumber);
    }
}
