import { rename, writeFile } from "fs/promises";
import { createWriteStream } from "fs";
import path from "path";
import crypto from "crypto";

import filesData from "../../fileDB.json" with { type: "json" };

const cwd = process.cwd();
const storagePath = `${cwd}/storage`;
const trashPath = `${cwd}/trash`;

export const createFile = async (req, res) => {
  const { filename } = req.params;
  const ext = path.extname(filename);
  try {
    const id = crypto.randomUUID();
    const fullFileName = `${id}${ext}`;
    const writeStream = createWriteStream(`${storagePath}/${fullFileName}`);
    req.pipe(writeStream);
    req.on("end", async () => {
      filesData.push({
        id,
        ext,
        name: filename,
      });
      await writeFile("./fileDB.json", JSON.stringify(filesData));
      res.status(201).json({
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
  const fileData = filesData.find((f) => f.id === id);
  console.log(fileData)
  if (!fileData) {
    return res.status(404).json({ message: "File not found" });
  }
  const filePath = `${id}`;
  if (req.query.action === "download") {
    res.setHeader("Content-Disposition", `attachment; filename="${filePath}"`);
  } else {
    res.setHeader("Content-Disposition", `inline; filename="${filePath}"`);
  }
  res.sendFile(`${storagePath}/${filePath}`, (err) => {
    if (err) {
      console.error(err);
      res.status(404).json({ message: "File not found" });
    }
  });
};

// Update
export const updateFile = async (req, res) => {
  const filePath = path.join("/", req.params[0]);
  const { newFilename } = req.body;

  try {
    const oldFullPath = path.join("storage", filePath);
    const dir = path.dirname(filePath); // "images"
    const newFullPath = path.join("storage", dir, newFilename);
    await rename(oldFullPath, newFullPath);
    res.json({ message: "Renamed" });
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: "File not found" });
  }
};

export const deleteFile = async (req, res) => {
  const filePath = path.join("/", req.params[0]);
  const filename = path.basename(filePath);
  const newPath = `${trashPath}/${filename}`;
  try {
    await rename(`${storagePath}/${filePath}`, newPath);
    res.status(204).json({
      message: "File Deleted Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({
      message: "File not found",
    });
  }
};
