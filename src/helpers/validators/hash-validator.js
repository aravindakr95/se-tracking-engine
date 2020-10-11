import bcrypt from 'bcrypt';

export default async function validatePasswordOfUser({
    password,
    hash
}) {
    return bcrypt.compare(password, hash);
}
