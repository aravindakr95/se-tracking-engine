import { hashSync, compare } from 'bcrypt';
import config from '../../config/config';
import customException from '../utilities/custom-exception';

function hashField({
  password,
}) {
  if (password) {
    return hashSync(password, config.authentication.saltRounds);
  }

  return customException('Password field is required');
}

function compareField({
  password,
  hash,
}) {
  if (password && hash) {
    return compare(password, hash);
  }

  return customException('Password and Hash fields are required');
}

export { hashField, compareField };
