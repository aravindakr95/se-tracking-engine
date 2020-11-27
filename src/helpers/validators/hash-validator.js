import bcrypt from 'bcrypt';

export default async function validatePasswordOfConsumer({
    password,
    hash
}) {
    return bcrypt.compare(password, hash);
}
