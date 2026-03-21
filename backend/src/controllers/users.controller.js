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
