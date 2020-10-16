import User from '../models/user';

export default function makeUserList() {
    return Object.freeze({
        getAllUsers,
        findUserByAccNumber,
        findUserByDeviceId,
        findDeviceIdByAccNumber,
        updateUserByAccNumber,
        deleteUserByAccNumber
    });

    async function getAllUsers() {
        try {
            return User.find().then((data) => {
                return data;
            }).catch((error) => {
                return error;
            });
        } catch (error) {
            return error;
        }
    }

    async function findUserByAccNumber(accNumber) {
        try {
            return User.findOne(accNumber).lean(true).then((data) => {
                return data;
            }).catch((error) => {
                return error;
            });
        } catch (error) {
            return error;
        }
    }

    async function findUserByDeviceId(deviceId) {
        try {
            return User.findOne({
                'devices.deviceId': deviceId
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
            const user = await findUserByAccNumber(accNumber);

            if (user && user.devices) {
                const { deviceId } = user.devices.find(device => device.type === type);
                console.log(deviceId);

                return deviceId;
            } else {
                return null;
            }
        } catch (error) {
            return error;
        }
    }

    async function updateUserByAccNumber(accNumber, data) {
        try {
            return User.findOneAndUpdate(
                accNumber, data, { new: true }).then((data) => {
                return data;
            }).catch((error) => {
                return error;
            });
        } catch (error) {
            return error;
        }
    }

    async function deleteUserByAccNumber(accNumber) {
        try {
            return User.deleteOne(accNumber).then((data) => {
                return data;
            }).catch((error) => {
                return error;
            });
        } catch (error) {
            return error;
        }
    }
}
