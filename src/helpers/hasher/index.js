import bcrypt from 'bcrypt';
import config from '../../config/config';

export default function hashValue({
    password
}) {
    if (password) {
        return bcrypt.hashSync(password, config.authentication.saltRounds);
    } else {
        throw Error('Password field is required');
    }

}
