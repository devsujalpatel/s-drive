import { Router } from "express";
import { readdir, stat } from "node:fs/promises";
import path from "path";

const router = Router();

const storagePath = path.join(process.cwd(), "storage");
// const trashPath = path.join(process.cwd(), "trash");

router.get("/", async (req, res) => {
  try {
    const filesList = await readdir(storagePath);

    const resData = [];

    for (const item of filesList) {
      const stats = await stat(`${storagePath}/${item}`);
      resData.push({
        name: item,
        isDirectory: stats.isDirectory(),
      });
    }
    res.status(200).json(resData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default router;
