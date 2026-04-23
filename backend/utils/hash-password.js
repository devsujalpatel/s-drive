import bcrypt from "bcryptjs";

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return { salt, hashedPassword };
};

export const verifyPassword = async ({ password, hashedPassword, salt }) => {
  const newHashToCompare = await bcrypt.hash(password, salt);
  return newHashToCompare === hashedPassword;
};
