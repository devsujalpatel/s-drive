// import { readdir, stat, mkdir } from "node:fs/promises";
import path from "node:path";

import directoriesData from "../../directoryDB.json" with { type: "json" };
import filesData from "../../fileDB.json" with { type: "json" };

const cwd = process.cwd();
const storagePath = `${cwd}/storage`;

export const getDirectoryContents = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      const directoryData = directoriesData[0];
      const files  = directoryData.files.map((fileId) =>
        filesData.find((file) => file.id === fileId),
      );
      res.json({ ...directoryData, files });
    }
    const directoryData = directoriesData.find((directory) => directory.id === id);
    const files = directoryData.files.map((fileId) =>
      filesData.find((file) => file.id === fileId),
    );
    res.json({ ...directoryData, files });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const createDirectory = async (req, res) => {
  const dirname = path.join("/", req.params[0]);
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
