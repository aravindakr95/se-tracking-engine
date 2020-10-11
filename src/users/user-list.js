import User from '../models/user';

export default function makeUserList() {
    return Object.freeze({
        getAllUsers,
        findUserById
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

    async function findUserById(id) {
        try {
            return User.findOne({
                _id: id
            }).lean(true).then((data) => {
                return data;
            }).catch((error) => {
                return error;
            });
        } catch (error) {
            return error;
        }
    }
}
