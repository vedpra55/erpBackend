import bcrypt from "bcrypt";
const salt = bcrypt.genSaltSync(12);

export function hashPassword(password) {
  return bcrypt.hashSync(password, salt);
}

export function comparePassword(inputPassword, hashedPassword) {
  return bcrypt.compareSync(inputPassword, hashedPassword);
}
