import crypto from "crypto";

import directoriesData from "../../directoryDB.json" with { type: "json" };
import usersData from "../../usersDB.json" with { type: "json" };
import { writeFile } from "fs/promises";

export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUserIndex = usersData.find((user) => user.email === email);

  if (existingUserIndex) {
    return res.status(400).json({
      error: "User already exists",
    });
  }

  const dirId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  directoriesData.push({
    id: dirId,
    name: `root-${email}`,
    userId,
    parentDirId: null,
    files: [],
    directories: [],
  });

  usersData.push({
    id: userId,
    name,
    email,
    password,
    rootDirId: dirId,
  });
  try {
    await writeFile("./directoryDB.json", JSON.stringify(directoriesData));
    await writeFile("./usersDB.json", JSON.stringify(usersData));
    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  const user = usersData.find((user) => user.email === email);
  if (!user) {
    return res.status(400).json({
      error: "Invalid Credentials",
    });
  }

  if (user.password !== password) {
    return res.status(400).json({
      error: "Invalid Credentials",
    });
  }

  try {
    res.cookie("uid", user.id, {
      httpOnly: true,
      maxAge: 60 * 1000 * 60 * 24 * 7, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
};
