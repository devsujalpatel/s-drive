import directoriesData from "../../directoryDB.json" with { type: "json" };
import filesData from "../../fileDB.json" with { type: "json" };
// import usersData from "../../usersDB.json" with { type: "json" };
import crypto from "crypto";
import { rm, writeFile } from "fs/promises";
import { cwd } from "process";

const home = cwd();

export const getDirectoryContents = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const directoryData = id
      ? directoriesData.find((directory) => directory.id === id)
      : directoriesData.find((directory) => directory.id === user.rootDirId);

    if (!directoryData) {
      return res.status(404).json({ message: "Directory not found" });
    }

    const files = directoryData.files
      .map((fileId) => filesData.find((file) => file.id === fileId))
      .filter(Boolean);

    const directories = directoryData.directories
      .map((dirId) => directoriesData.find((dir) => dir.id === dirId))
      .map(({ id, name, parentDirId }) => ({ id, name, parentDirId }));

    return res.status(200).json({ ...directoryData, files, directories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const createDirectory = async (req, res) => {
  const { parentDirId } = req.params;
  const dirname = req.headers.dirname || "New Folder";
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  if (!dirname) {
    return res.status(400).json({
      message: "Dirname is required",
    });
  }

  try {
    const directoryData = parentDirId
      ? directoriesData.find((directory) => directory.id === parentDirId)
      : directoriesData.find((d) => d.id === user.rootDirId);

    if (!directoryData) {
      return res.status(404).json({
        message: "Parent Directory Not Found",
      });
    }

    const newParentDirId = parentDirId || user.rootDirId;

    const id = crypto.randomUUID();

    directoriesData.push({
      id,
      name: dirname,
      parentDirId: newParentDirId,
      userId: user.id,
      files: [],
      directories: [],
    });

    const parentDirData = directoriesData.find(
      (dir) => dir.id === newParentDirId,
    );

    if (parentDirData) {
      parentDirData.directories.push(id);
    }

    await writeFile("./directoryDB.json", JSON.stringify(directoriesData));

    return res.status(201).json({
      message: "Directory created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const renameDirectory = async (req, res) => {
  const { dirId } = req.params;
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  if (!dirId) {
    return res.status(400).json({
      message: "Id is required",
    });
  }
  const { newDirName } = req.body;
  if (!newDirName) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    const directoryData = dirId
      ? directoriesData.find((directory) => directory.id === dirId)
      : directoriesData.find((directory) => directory.id === user.rootDirId);

    if (!directoryData) {
      return res.status(404).json({
        message: "Directory Not Found",
      });
    }

    directoryData.name = newDirName;
    await writeFile("./directoryDB.json", JSON.stringify(directoriesData));

    return res.status(201).json({
      message: "Directory renamed successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteDirectory = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  if (!id) {
    return res.status(400).json({
      message: "Id is required",
    });
  }

  try {
    const dirIndex = directoriesData.findIndex((dir) => dir.id === id);
    const directoryData = directoriesData[dirIndex];

    if (!directoryData) {
      return res.status(404).json({
        message: "Directory Not Found",
      });
    }

    if (directoryData.userId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // delete child directories
    for (const childDirId of directoryData.directories) {
      const childIndex = directoriesData.findIndex((d) => d.id === childDirId);
      if (childIndex !== -1) {
        directoriesData.splice(childIndex, 1);
      }
    }

    // delete files
    for (const fileId of directoryData.files) {
      const fileIndex = filesData.findIndex((file) => file.id === fileId);
      const fileData = filesData[fileIndex];

      if (fileData) {
        await rm(`${home}/storage/${fileId}${fileData.extension}`);
        filesData.splice(fileIndex, 1);
      }
    }

    // remove from parent
    const parentDirData = directoriesData.find(
      (dir) => dir.id === directoryData.parentDirId,
    );

    if (parentDirData) {
      parentDirData.directories = parentDirData.directories.filter(
        (dirId) => dirId !== id,
      );
    }

    // delete self
    directoriesData.splice(dirIndex, 1);

    await writeFile("./directoryDB.json", JSON.stringify(directoriesData));
    await writeFile("./fileDB.json", JSON.stringify(filesData));

    return res.status(204).json({ message: "Directory Deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
