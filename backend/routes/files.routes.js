import { Router } from "express";
import { rename } from "fs/promises";
import { createWriteStream } from "fs";
import path from "path";

const router = Router();

const trashPath = path.join(process.cwd(), "trash");
// Create
router.post("/*", async (req, res) => {
  const { 0: filePath } = req.params;
  const writeStream = createWriteStream(`./storage/${filePath}`);
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
  res.sendFile(
    `/Users/zoro/Desktop/Coding/s-drive/backend/storage/${filePath}`,
  );
});

// Update
router.patch("/*", async (req, res) => {
  const { 0: filePath } = req.params;
  const { newFilename } = req.body;
  try {
    await rename(`./storage/${filePath}`, `./storage/${newFilename}`);
    res.status(204).json({
      message: "File Renamed Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({
      message: "File not found",
    });
  }
});

// Delete
router.delete("/*", async (req, res) => {
  const { 0: filePath } = req.params;
  console.log(filePath);
  const pathsArr = filePath.split("/");
  const filename = pathsArr[pathsArr.length - 1];
  const newPath = `${trashPath}/${filename}`;
  console.log(newPath);

  try {
    await rename(`./storage/${filePath}`, newPath);
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
