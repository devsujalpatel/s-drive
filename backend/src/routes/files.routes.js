import { Router } from "express";
import { rename } from "fs/promises";
import { createWriteStream } from "fs";
import path from "path";

const router = Router();

const trashPath = "/Users/zoro/Desktop/Coding/s-drive/backend/trash";
const storagePath = "/Users/zoro/Desktop/Coding/s-drive/backend/storage";
// Create
router.post("/*", async (req, res) => {
  const { 0: filePath } = req.params;
  const writeStream = createWriteStream(`${storagePath}/${filePath}`);
  req.pipe(writeStream);
  req.on("end", () => {
    res.status(201).json({
      message: "File uploaded",
    });
  });
});

// Read
router.get("/*", (req, res) => {
  const { 0: filePath } = req.params;

  if (req.query.action === "download") {
    res.setHeader("Content-Disposition", `attachment; filename="${filePath}"`);
  } else {
    res.setHeader("Content-Disposition", `inline; filename="${filePath}"`);
  }
  res.sendFile(`${storagePath}/${filePath}`);
});

// Update
router.patch("/*", async (req, res) => {
  const { 0: filePath } = req.params; // e.g. images/file.png
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
});

// Delete
router.delete("/*", async (req, res) => {
  const { 0: filePath } = req.params;
  const pathsArr = filePath.split("/");
  const filename = pathsArr[pathsArr.length - 1];
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
});

export default router;
