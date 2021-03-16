import bcrypt from 'bcrypt';

function validatePasswordOfConsumer({
  password,
  hash,
}) {
  return bcrypt.compare(password, hash);
}

export default validatePasswordOfConsumer;
