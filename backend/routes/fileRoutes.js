import express from "express";
import { createWriteStream } from "fs";
import { rm, writeFile } from "fs/promises";
import path from "path";
import directoriesData from "../directoriesDB.json" with { type: "json" };
import filesData from "../filesDB.json" with { type: "json" };
import validateId from "../middlewares/validateid.midlleware.js";
import { ObjectId } from "mongodb";

const router = express.Router();

router.param("id", validateId);
router.param("parentDirId", validateId);

// ================================
// CREATE
// ================================
router.post("/:id?", async (req, res, next) => {
  try {
    const parentDirId = req.params.id
      ? new ObjectId(req.params.id)
      : user.rootDirId;
    const db = req.db;
    const dirCollection = db.collection("directories");
    const fileCollection = db.collection("files");

    const parentDirData = await dirCollection.findOne({
      _id: new ObjectId(String(parentDirId)),
      userId: req.user._id,
    });

    // Check if parent directory exists
    if (!parentDirData) {
      return res.status(404).json({ error: "Parent directory not found!" });
    }

    const filename = req.headers.filename || "untitled";
    const extension = path.extname(filename);

    const insertedFile = await fileCollection.insertOne({
      extension,
      name: filename,
      parentDirId,
      userId: req.user._id,
    });

    const fileId = insertedFile.insertedId.toString();
    const fullFileName = `${fileId}${extension}`;

    const writeStream = createWriteStream(`./storage/${fullFileName}`);
    req.pipe(writeStream);

    req.on("end", () => {
      return res.status(201).json({ message: "File Uploaded" });
    });

    req.on("error", async () => {
      await fileCollection.deleteOne({ _id: insertedFile.insertedId });
      return res.status(408).json({ message: "Could Not Upload File" });
    });
  } catch (error) {
    next(error);
  }
});

// ================================
// READ
// ================================
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  const db = req.db;
  try {
    const fileCollection = db.collection("files");
    const fileData = await fileCollection.findOne({
      _id: new ObjectId(String(id)),
      userId: new ObjectId(String(user._id)),
    });

    // Check if file exists
    if (!fileData) {
      return res.status(404).json({ error: "File not found!" });
    }
    const filePath = `${process.cwd()}/storage/${id}${fileData.extension}`;

    // If "download" is requested, set the appropriate headers
    if (req.query.action === "download") {
      res.download(filePath, fileData.name);
    }

    // Send file
    return res.sendFile(filePath, (err) => {
      if (!res.headersSent && err) {
        return res.status(404).json({ error: "File not found!" });
      }
    });
  } catch (error) {
    next(error);
  }
});

// ================================
// UPDATE
// ================================
router.patch("/:id", async (req, res, next) => {
  const { id } = req.params;
  const fileData = filesData.find((file) => file.id === id);

  // Check if file exists
  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }

  // Check parent directory ownership
  const parentDir = directoriesData.find(
    (dir) => dir.id === fileData.parentDirId,
  );
  if (!parentDir) {
    return res.status(404).json({ error: "Parent directory not found!" });
  }
  if (parentDir.userId !== req.user.id) {
    return res
      .status(403)
      .json({ error: "You don't have access to this file." });
  }

  // Perform rename
  fileData.name = req.body.newFilename;
  try {
    await writeFile("./filesDB.json", JSON.stringify(filesData));
    return res.status(200).json({ message: "Renamed" });
  } catch (err) {
    err.status = 500;
    next(err);
  }
});

// ================================
// DELETE
// ================================
router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  const fileIndex = filesData.findIndex((file) => file.id === id);

  // Check if file exists
  if (fileIndex === -1) {
    return res.status(404).json({ error: "File not found!" });
  }

  const fileData = filesData[fileIndex];

  // Check parent directory ownership
  const parentDir = directoriesData.find(
    (dir) => dir.id === fileData.parentDirId,
  );
  if (!parentDir) {
    return res.status(404).json({ error: "Parent directory not found!" });
  }
  if (parentDir.userId !== req.user.id) {
    return res
      .status(403)
      .json({ error: "You don't have access to this file." });
  }

  try {
    // Remove file from filesystem
    await rm(`./storage/${id}${fileData.extension}`, { recursive: true });

    // Remove file from DB
    filesData.splice(fileIndex, 1);
    parentDir.files = parentDir.files.filter((fileId) => fileId !== id);

    // Persist changes
    await writeFile("./filesDB.json", JSON.stringify(filesData));
    await writeFile("./directoriesDB.json", JSON.stringify(directoriesData));

    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
