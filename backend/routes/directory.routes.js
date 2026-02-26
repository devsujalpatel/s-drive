import { Router } from "express";
import { readdir, stat } from "node:fs/promises";
import path from "path";

const router = Router();

const storagePath = path.join(process.cwd(), "storage");
// const trashPath = path.join(process.cwd(), "trash");

router.get("/:dirname?", async (req, res) => {
  const { dirname } = req.params;

  const fullDirPath = `${storagePath}/${dirname ? dirname : ""}`;

  try {
    const filesList = await readdir(fullDirPath);
    const resData = [];

    for (const item of filesList) {
      const stats = await stat(`${fullDirPath}/${item}`);
      resData.push({
        name: item,
        isDirectory: stats.isDirectory(),
      });
    }
    res.status(200).json(resData);
  } catch (error) {
    // 👇 THIS IS THE IMPORTANT PART
    if (error.code === "ENOENT") {
      return res.status(404).json({
        message: "Folder not found",
      });
    }

    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default router;
