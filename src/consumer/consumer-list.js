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
        try {
            return Consumer.find().then((data) => {
                return data;
            }).catch((error) => {
                return error;
            });
        } catch (error) {
            return error;
        }
    }

    async function findConsumersByStatus(status) {
        try {
            return Consumer.find(status).then((data) => {
                return data;
            }).catch((error) => {
                return error;
            });
        } catch (error) {
            return error;
        }
    }

    async function findConsumerByAccNumber(accNumber) {
        try {
            return Consumer.findOne({ accountNumber: accNumber, status: 'ACTIVE' }).lean(true).then((data) => {
                return data;
            }).catch((error) => {
                return error;
            });
        } catch (error) {
            return error;
        }
    }

    async function findConsumerByDeviceId(deviceId) {
        try {
            return Consumer.findOne({
                'devices.deviceId': deviceId,
                'status': 'ACTIVE'
            }).then((data) => {
                return data;
            }).catch((error) => {
                return error;
            });
        } catch (error) {
            return error;
        }
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
        try {
            return Consumer.findOneAndUpdate(
                accNumber, data, { new: true }).then((data) => {
                return data;
            }).catch((error) => {
                return error;
            });
        } catch (error) {
            return error;
        }
    }

    async function updateConsumerStatusByContactNumber(contactNumber, data) {
        try {
            return Consumer.updateOne(contactNumber, data).then((data) => {
                return data;
            }).catch((error) => {
                return error;
            });
        } catch (error) {
            return error;
        }
    }

    async function deleteConsumerByAccNumber(accNumber) {
        try {
            return Consumer.deleteOne(accNumber).then((data) => {
                return data;
            }).catch((error) => {
                return error;
            });
        } catch (error) {
            return error;
        }
    }
}
