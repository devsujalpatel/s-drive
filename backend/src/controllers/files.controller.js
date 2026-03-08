import { rm, writeFile } from "fs/promises";
import { createWriteStream } from "fs";
import path from "path";
import crypto from "crypto";

import filesData from "../../fileDB.json" with { type: "json" };
import directoriesData from "../../directoryDB.json" with { type: "json" };

const cwd = process.cwd();
const storagePath = `${cwd}/storage`;

export const createFile = async (req, res) => {
  const { filename } = req.params;
  const extenstion = path.extname(filename);

  try {
    const id = crypto.randomUUID();
    const fullFileName = `${id}${extenstion}`;
    const writeStream = createWriteStream(`${storagePath}/${fullFileName}`);
    req.pipe(writeStream);
    req.on("end", async () => {
      filesData.push({
        id,
        extenstion,
        name: filename,
      });
      if (!filesData) {
        return res.status(404).json({ message: "NO FILE DATA" });
      }
      await writeFile("./fileDB.json", JSON.stringify(filesData));
      return res.status(201).json({
        message: "File uploaded",
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Read
export const readFile = async (req, res) => {
  const { id } = req.params;
  const fileData = filesData.find((file) => file.id === id);
  if (!fileData) {
    return res.status(404).json({ message: "File not found" });
  }

  if (req.query.action === "download") {
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${id}${fileData.extenstion}"`,
    );
  } else {
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${id}${fileData.extenstion}"`,
    );
  }
  res.sendFile(`${storagePath}/${id}${fileData.extenstion}`, (err) => {
    if (err) {
      console.error(err);
      res.status(404).json({ message: "File not found" });
    }
  });
};

// Update
export const updateFile = async (req, res) => {
  const { id } = req.params;
  const { newFilename } = req.body;

  const fileData = filesData.find((file) => file.id === id);
  fileData.name = newFilename;
  try {
    await writeFile("./fileDB.json", JSON.stringify(filesData));
    res.json({ message: "File Renamed successfully" });
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: "File not found" });
  }
};

export const deleteFile = async (req, res) => {
  const { id } = req.params;
  try {
    const fileIndex = filesData.findIndex((file) => file.id === id);

    const fileData = filesData[fileIndex];
    await rm(`${storagePath}/${id}${fileData.extenstion}`);
    filesData.splice(fileIndex, 1);
    const parentDirData = directoriesData.find(
      (dirData) => dirData.id === fileData.parentDirId,
    );
    parentDirData.files = parentDirData.files.filter((fileId) => fileId !== id);
    await writeFile("./fileDB.json", JSON.stringify(filesData));
    await writeFile("./directoryDB.json", JSON.stringify(directoriesData));
    res.status(200).json({
      message: "File Deleted Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({
      message: "File not found",
    });
  }
};
