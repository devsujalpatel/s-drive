import { Router } from "express";
import { rename } from "fs/promises";
import { createWriteStream } from "fs";
import path from "path";


const router = Router();


const storagePath = path.join(process.cwd(), "storage");
const trashPath = path.join(process.cwd(), "trash");
// Create
router.post("/:filename", async (req, res) => {
   const writeStream =  createWriteStream(`${storagePath}/${req.params.filename}`);
   req.pipe(writeStream)
   req.on("end", () => {
    res.status(201).json({
      message: "File uploaded"
    });
   });
})

// Read
router.get("/:filename", (req, res) => {
  const {filename} = req.params;
 
  if (req.query.action === "download") {
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
  } else {
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${filename}"`
    );
  }
  res.sendFile(`${storagePath}/${filename}`)
})

// Update
router.patch("/:filename",  async (req, res) => {
  const {filename} = req.params;
  const {newFilename} = req.body;

  const filePath = path.join(storagePath, filename);
  const newPath = path.join(storagePath, newFilename);
   try {
   await rename(filePath, newPath, (err) => {
    if (err) throw err;
   });
   res.status(204).json({
    message: "File Renamed Successfully"
  })

 } catch (error) {
  console.error(error)
  res.status(404).json({
    message: "File not found"
  })
 }
})

// Delete
router.delete("/:filename",  async (req, res) => {
  const {filename} = req.params;

  const filePath = `${storagePath}/${filename}`;
  const newPath = `${trashPath}/${filename}`
   try {
   await rename(filePath, newPath);
   res.status(204).json({
    message: "File Deleted Successfully"
  })

 } catch (error) {
  console.error(error)
  res.status(404).json({
    message: "File not found"
  })
 }
})

export default router;