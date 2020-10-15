import User from '../models/user';

export default function makeUserList() {
    return Object.freeze({
        getAllUsers,
        findUserByAccNumber,
        getUserByDeviceId,
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

    //todo: to be implemented
    async function getUserByDeviceId(deviceId) {}

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
