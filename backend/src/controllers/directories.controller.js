import { readdir, stat, mkdir } from "node:fs/promises";

const storagePath = "/Users/zoro/Desktop/Coding/s-drive/backend/storage";

export const getDirectoryContents = async (req, res) => {
  const { 0: dirname } = req.params;
  const fullDirPath = `${storagePath}/${dirname ? dirname : ""}`;
  try {
    const filesList = await readdir(fullDirPath);
    const resData = [];
    for (const item of filesList) {
      const stats = await stat(`${fullDirPath}/${item}`);
      resData.push({
        name: item,
        isDirectory: stats.isDirectory(),
      });
    }
    res.status(200).json(resData);
  } catch (error) {
    // 👇 THIS IS THE IMPORTANT PART
    if (error.code === "ENOENT") {
      return res.status(404).json({
        message: "Folder not found",
      });
    }
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const createDirectory = async (req, res) => {
  const { 0: dirname } = req.params;
  try {
    const newDirPath = `${storagePath}/${dirname}`;
    await mkdir(newDirPath);
    res.status(201).json({
      message: "Directory created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
