import User from '../models/user';

export default function makeUserList() {
    return Object.freeze({
        getAllUsers,
        findUserByAccNumber
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
}
