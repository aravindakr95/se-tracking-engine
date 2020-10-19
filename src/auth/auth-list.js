import User from '../models/user';
import TempUser from '../models/temp-user';

export default function makeAuthList() {
    return Object.freeze({
        addUser,
        addUserOnPending,
        findUserOnPending,
        removeUserOnPending,
        findByEmail
    });

    async function addUser(user) {
        try {
            return new User(user).save();
        } catch (error) {
            console.log(error.message);
            return error;
        }
    }

    async function addUserOnPending(tempUser) {
        try {
            return new TempUser(tempUser).save();
        } catch (error) {
            console.log(error.message);
            return error;
        }
    }

    async function findUserOnPending(msisdn) {
        try {
            return TempUser.findOne(msisdn);
        } catch (error) {
            console.log(error.message);
            return error;
        }
    }

    async function removeUserOnPending(msisdn) {
        try {
            return TempUser.deleteOne(msisdn).then((data) => {
                return data;
            }).catch((error) => {
                return error;
            });
        } catch (error) {
            return error;
        }
    }

    async function findByEmail(email) {
        try {
            return User.findOne(email);
        } catch (error) {
            console.log(error.message);
            return error;
        }
    }
}
