import bcrypt from "bcryptjs";

const { genSalt, hash, compare } = bcrypt;

export async function hashPassword(password) {
  const salt = await genSalt(10);
  return hash(password, salt);
}

export async function verifyPassword(password, passwordHash) {
  return compare(password, passwordHash);
}

