import bcrypt from 'bcrypt';

export default function hashValue({
    password
}) {
    if (password) {
        return bcrypt.hashSync(password, 10);
    } else {
        throw Error('Password field is required');
    }

}
