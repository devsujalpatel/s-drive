import { Router } from "express";

import {
  createFile,
  readFile,
  updateFile,
  deleteFile,
} from "../controllers/files.controller.js";

const router = Router();

const trashPath = "/Users/zoro/Desktop/Coding/s-drive/backend/trash";
const storagePath = "/Users/zoro/Desktop/Coding/s-drive/backend/storage";
// Create
router.post("/*", createFile);

// Read
router.get("/*", readFile);

// Update
router.patch("/*", updateFile);

// Delete
router.delete("/*", deleteFile);

export default router;
