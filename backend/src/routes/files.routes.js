import { Router } from "express";

import {
  createFile,
  readFile,
  updateFile,
  deleteFile,
} from "../controllers/files.controller.js";

const router = Router();

// Create
router.post("/:filename", createFile);

// Read
router.get("/*", readFile);

// Update
router.patch("/*", updateFile);

// Delete
router.delete("/*", deleteFile);

export default router;
