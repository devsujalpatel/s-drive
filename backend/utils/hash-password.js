import crypto from "crypto";

export const hashPassword = (password) => {
  return crypto
    .createHmac("sha256", process.env.PASSWORD_SECRET)
    .update(password)
    .digest("base64url");
};

export const verifyPassword = (password, hashedPassword) => {
  const newHashedPassword = hashPassword(password);
  return newHashedPassword === hashedPassword;
};
