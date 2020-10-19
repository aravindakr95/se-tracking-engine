import User from '../models/end-user/user';

export default function makeUserList() {
    return Object.freeze({
        getAllUsers,
        findUsersByStatus,
        findUserByAccNumber,
        findUserByDeviceId,
        findDeviceIdByAccNumber,
        updateUserByAccNumber,
        updateUserStatusByContactNumber,
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

    async function findUsersByStatus(status) {
        try {
            return User.find(status).then((data) => {
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
            return User.findOne({ accountNumber: accNumber, status: 'ACTIVE' }).lean(true).then((data) => {
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
            const user = await findUserByAccNumber(accNumber);

            if (user && user.devices) {
                const { deviceId } = user.devices.find(device => device.type === type);

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

    async function updateUserStatusByContactNumber(contactNumber, data) {
        try {
            return User.updateOne(contactNumber, data).then((data) => {
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
