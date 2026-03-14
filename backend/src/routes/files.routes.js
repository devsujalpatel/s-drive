import { Router } from "express";

import {
  createFile,
  readFile,
  updateFile,
  deleteFile,
} from "../controllers/files.controller.js";

const router = Router();

// Create
router.post("{/:parentDirId}", createFile);

// Read
router.get("/:id", readFile);

// Update
router.patch("/:id", updateFile);

// Delete
router.delete("/:id", deleteFile);

export default router;
