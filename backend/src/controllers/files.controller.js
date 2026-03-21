import { rm, writeFile } from "fs/promises";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { pipeline } from "stream/promises";

import filesData from "../../fileDB.json" with { type: "json" };
import directoriesData from "../../directoryDB.json" with { type: "json" };

const cwd = process.cwd();
const storagePath = `${cwd}/storage`;

export const createFile = async (req, res) => {
  let tempPath;

  try {
    const parentDirId = req.params.parentDirId || directoriesData[0].id;
    const filename = req.headers["filename"] || "Unnamed File ";

    if (!filename) {
      return res.status(400).json({ message: "Filename header missing" });
    }

    const parentDirData = directoriesData.find((d) => d.id === parentDirId);
    if (!parentDirData) {
      return res.status(404).json({ message: "Parent directory not found" });
    }

    const id = crypto.randomUUID();
    const extension = path.extname(filename);

    const finalPath = path.join(storagePath, `${id}${extension}`);
    tempPath = path.join(storagePath, `${id}.upload`);

    const writeStream = fs.createWriteStream(tempPath);

    req.on("aborted", () => {
      writeStream.destroy(new Error("Client aborted upload"));
    });

    await pipeline(req, writeStream);

    filesData.push({
      id,
      extension,
      name: filename,
      parentDirId,
    });

    parentDirData.files.push(id);

    await Promise.all([
      fs.promises.writeFile("./fileDB.json", JSON.stringify(filesData)),
      fs.promises.writeFile(
        "./directoryDB.json",
        JSON.stringify(directoriesData),
      ),
    ]);

    await fs.promises.rename(tempPath, finalPath);

    return res.status(201).json({ message: "File uploaded" });
  } catch (err) {
    console.error("Upload failed:", err);

    // cleanup temp file
    if (tempPath && fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }

    return res.status(500).json({ message: "Upload failed" });
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
      `attachment; filename="${fileData.name}"`,
    );
  } else {
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${id}${fileData.extension}"`,
    );
  }
  res.sendFile(`${storagePath}/${id}${fileData.extension}`, (err) => {
    if (!res.headersSent) {
      return res.status(404).json({ message: "File not found" });
    }
  });
};

// Update
export const updateFile = async (req, res) => {
  const { id } = req.params;
  const { newFilename } = req.body;
  if (!id || !newFilename) {
    return res.status(400).json({
      message: "All Fields are required",
    });
  }

  const fileData = filesData.find((file) => file.id === id);
  if (!fileData) {
    return res.status(404).json({
      message: "File Not Found",
    });
  }
  fileData.name = newFilename;
  try {
    await writeFile("./fileDB.json", JSON.stringify(filesData));
    return res.status(200).json({ message: "File Renamed successfully" });
  } catch (err) {
    console.error(err);
    return res.status(404).json({ message: "File not found" });
  }
};

export const deleteFile = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      message: "Id is required",
    });
  }
  try {
    const fileIndex = filesData.findIndex((file) => file.id === id);

    const fileData = filesData[fileIndex];
    if (!fileData) {
      return res.status(404).json({
        message: "File Not Found",
      });
    }
    await rm(`${storagePath}/${id}${fileData.extension}`);
    filesData.splice(fileIndex, 1);
    const parentDirData = directoriesData.find(
      (dirData) => dirData.id === fileData.parentDirId,
    );
    parentDirData.files = parentDirData.files.filter((fileId) => fileId !== id);
    await writeFile("./fileDB.json", JSON.stringify(filesData));
    await writeFile("./directoryDB.json", JSON.stringify(directoriesData));
    return res.status(200).json({
      message: "File Deleted Successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(404).json({
      message: "File not found",
    });
  }
};
