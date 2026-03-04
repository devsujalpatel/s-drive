import { rename } from "fs/promises";
import { createWriteStream } from "fs";
import path from "path";

const trashPath = "/Users/zoro/Desktop/Coding/s-drive/backend/trash";
const storagePath = "/Users/zoro/Desktop/Coding/s-drive/backend/storage";

export const createFile = async (req, res) => {
  const filePath = path.join("/", req.params[0]);
  const writeStream = createWriteStream(`${storagePath}/${filePath}`);
  req.pipe(writeStream);
  req.on("end", () => {
    res.status(201).json({
      message: "File uploaded",
    });
  });
};

// Read
export const readFile = async (req, res) => {
  const filePath = path.join("/", req.params[0]);

  if (req.query.action === "download") {
    res.setHeader("Content-Disposition", `attachment; filename="${filePath}"`);
  } else {
    res.setHeader("Content-Disposition", `inline; filename="${filePath}"`);
  }
  res.sendFile(`${storagePath}/${filePath}`);
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
