import { createWriteStream } from "fs";
import { rm } from "fs/promises";
import path from "path";
import Directory from "../models/directory.model.js";
import File from "../models/file.model.js";
import { fileName } from "../schemas/file.schema.js";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

const MAX_FILE_SIZE = 500 * 1024 * 1024;

export async function updateDirectorySize(parentId, deltaSize) {
  while (parentId) {
    const dir = await Directory.findById(parentId);
    if (!dir) break;
    dir.size += deltaSize;
    await dir.save();
    parentId = dir.parentDirId;
  }
}

// Create


export const uploadFile = async (req, res, next) => {
  let insertedFile = null;
  let filePath = null;

  try {
    const user = req.user;

    if (user.deleted) {
      return res.status(401).json({
        error:
          "Your account has been deleted. Please contact support if you need assistance.",
      });
    }

    const parentDirId = req.params.id
      ? req.params.id
      : user.rootDirId.toString();

    const [parentDirData, rootDir] = await Promise.all([
      Directory.findOne({
        _id: parentDirId,
        userId: user._id,
      }),

      Directory.findOne({
        _id: user.rootDirId,
        userId: user._id,
      }),
    ]);

    if (!parentDirData) {
      return res.status(404).json({
        error: "Parent directory not found!",
      });
    }

    if (!rootDir) {
      return res.status(404).json({
        error: "Root directory not found!",
      });
    }

    const filename =
      typeof req.headers.filename === "string"
        ? req.headers.filename
        : "untitled";

    const filesize = Number(req.headers.filesize);

    if (!Number.isSafeInteger(filesize) || filesize < 0) {
      return res.status(400).json({
        error: "Invalid file size",
      });
    }

    if (filesize > MAX_FILE_SIZE) {
      return res.status(413).json({
        error: "File too large",
      });
    }

    const availableSpace = user.maxStorageInBytes - rootDir.size;

    if (filesize > availableSpace) {
      return res.status(413).json({
        error: "Not enough storage space",
      });
    }

    const extension = path.extname(filename);

    insertedFile = await File.create({
      extension,
      name: filename,
      size: filesize,
      parentDirId,
      userId: user._id,
    });

    const fileId = insertedFile._id.toString();

    const fullFileName = `${fileId}${extension}`;

    filePath = path.join("./storage", fullFileName);

    let totalFileSize = 0;

    const sizeLimiter = new Transform({
      transform(chunk, encoding, callback) {
        totalFileSize += chunk.length;

        if (totalFileSize > filesize) {
          callback(new Error("FILE_SIZE_EXCEEDED"));
          return;
        }

        callback(null, chunk);
      },
    });

    const writeStream = createWriteStream(filePath);

    await pipeline(
      req,
      sizeLimiter,
      writeStream,
    );

     // * Client said the file was X bytes,
     // * but actually sent fewer bytes.
    if (totalFileSize !== filesize) {
      throw new Error("FILE_SIZE_MISMATCH");
    }

    /*
     * Use the actual received size.
     */
    await File.updateOne(
      { _id: insertedFile._id },
      {
        $set: {
          size: totalFileSize,
        },
      },
    );

    await updateDirectorySize(
      parentDirId,
      totalFileSize,
    );

    return res.status(201).json({
      message: "File Uploaded",
    });
  } catch (error) {
    /*
     * Cleanup database record
     */
    if (insertedFile?._id) {
      await File.deleteOne({
        _id: insertedFile._id,
      }).catch(() => {});
    }

     // * Cleanup partially written file
    if (filePath) {
      await rm(filePath, {
        force: true,
      }).catch(() => {});
    }

     // * Client uploaded more than declared.
    if (
      error instanceof Error &&
      error.message === "FILE_SIZE_EXCEEDED"
    ) {
      return res.status(413).json({
        error: "Uploaded file exceeds declared size",
      });
    }

     // * Client uploaded fewer bytes than declared.
    if (
      error instanceof Error &&
      error.message === "FILE_SIZE_MISMATCH"
    ) {
      return res.status(400).json({
        error: "Uploaded file size does not match declared size",
      });
    }

     // * Client disconnected / request was aborted.
    if (req.destroyed || req.aborted) {
      return;
    }
    next(error);
  }
};

// Read
export const getFile = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  try {
    const fileData = await File.findOne({
      _id: String(id),
      userId: user._id,
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

  const { newFileName } = fileName.parse(req.body);

  try {
    const file = await File.findOne({
      _id: String(id),
      userId: String(user._id),
    });

    if (!file) {
      return res.status(404).json({ error: "File not found!" });
    }
    file.name = newFileName || file.name;
    await file.save();
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
    const file = await File.findOne({
      _id: String(id),
      userId: String(user._id),
    });

    if (!file) {
      return res.status(404).json({ error: "File not found!" });
    }


    await file.deleteOne();
    await rm(`./storage/${id}${file.extension}`, { recursive: true });
    await updateDirectorySize(file.parentDirId, -file.size);

    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err);
  }
};
