import User from '../models/user';

export default function makeAuthList() {
    return Object.freeze({
        addUser,
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

    async function findByEmail(email) {
        try {
            return User.findOne(email);
        } catch (error) {
            console.log(error.message);
            return error;
        }
    }
}
