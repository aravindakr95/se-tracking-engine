import bcrypt from 'bcrypt';
import config from '../../config/config';

function hashValue({
  password,
}) {
  if (password) {
    return bcrypt.hashSync(password, config.authentication.saltRounds);
  }
  throw Error('Password field is required');
}

export default hashValue;
