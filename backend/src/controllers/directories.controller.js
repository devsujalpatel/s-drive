import directoriesData from "../../directoryDB.json" with { type: "json" };
import filesData from "../../fileDB.json" with { type: "json" };
import crypto from "crypto";
import { writeFile } from "fs/promises";

export const getDirectoryContents = async (req, res) => {
  const { id } = req.params;

  try {
    const directoryData = id
      ? directoriesData.find((directory) => directory.id === id)
      : directoriesData[0];

    if (!directoryData) {
      return res.status(404).json({ message: "Directory not found" });
    }

    const files = directoryData.files
      .map((fileId) => filesData.find((file) => file.id === fileId))
      .filter(Boolean);

    const directories = directoryData.directories
      .map((dirId) => directoriesData.find((dir) => dir.id === dirId))
      .map(({ id, name, parentDirId }) => ({ id, name, parentDirId }));

    return res.json({ ...directoryData, files, directories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const createDirectory = async (req, res) => {
  const { parentDirId } = req.params;
  const { dirname } = req.headers;
  if (!dirname) {
    return res.json({
      message: "All fields are required",
    });
  }

  try {
    const directoryData = parentDirId
      ? directoriesData.find((directory) => directory.id === parentDirId)
      : directoriesData[0];

    const newParentDirId = parentDirId ? parentDirId : directoryData.id;

    const id = crypto.randomUUID();

    directoriesData.push({
      id,
      name: dirname,
      parentDirId: newParentDirId,
      files: [],
      directories: [],
    });

    directoryData.directories.push(id);
    await writeFile("./directoryDB.json", JSON.stringify(directoriesData));

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
