import { createWriteStream } from "fs";
import { rm } from "fs/promises";
import path from "path";
import { ObjectId } from "mongodb";
import Directory from "../models/directory.model.js";
import File from "../models/file.model.js";

// Create
export const uploadFile = async (req, res, next) => {
  try {
    const user = req.user;
    const parentDirId = req.params.id
      ? new ObjectId(req.params.id)
      : user.rootDirId;

    const parentDirData = await Directory.findOne({
      _id: new ObjectId(String(parentDirId)),
      userId: req.user._id,
    });

    // Check if parent directory exists
    if (!parentDirData) {
      return res.status(404).json({ error: "Parent directory not found!" });
    }

    const filename = req.headers.filename || "untitled";
    const extension = path.extname(filename);

    const insertedFile = await File.create({
      extension,
      name: filename,
      parentDirId,
      userId: req.user._id,
    });

    const fileId = insertedFile._id.toString();
    const fullFileName = `${fileId}${extension}`;

    const writeStream = createWriteStream(`./storage/${fullFileName}`);
    req.pipe(writeStream);

    req.on("end", () => {
      return res.status(201).json({ message: "File Uploaded" });
    });

    req.on("error", async () => {
      await File.deleteOne({ _id: insertedFile._id });
      return res.status(408).json({ message: "Could Not Upload File" });
    });
  } catch (error) {
    next(error);
  }
};

// Read
export const getFile = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  try {
    const fileData = await File.findOne({
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
};

// Update
export const updateFile = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const fileData = await File.findOne({
      _id: new ObjectId(String(id)),
      userId: new ObjectId(String(user._id)),
    });

    if (!fileData) {
      return res.status(404).json({ error: "File not found!" });
    }
    await File.updateOne(
      {
        _id: new ObjectId(String(id)),
        userId: new ObjectId(String(user._id)),
      },
      {
        $set: {
          name: req.body.newFilename,
        },
      },
    );

    return res.status(200).json({ message: "Renamed" });
  } catch (err) {
    err.status = 500;
    next(err);
  }
};

// Delete
export const deleteFile = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;

  try {

    const fileData = await File.findOne({
      _id: new ObjectId(String(id)),
      userId: new ObjectId(String(user._id)),
    });

    if (!fileData) {
      return res.status(404).json({ error: "File not found!" });
    }

    await rm(`./storage/${id}${fileData.extension}`, { recursive: true });
    await File.deleteOne({
      _id: new ObjectId(String(id)),
      userId: new ObjectId(String(user._id)),
    });

    // Remove file from filesystem
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err);
  }
};
