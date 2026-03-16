import { Router } from "express";
import {
  createDirectory,
  deleteDirectory,
  getDirectoryContents,
  renameDirectory,
} from "../controllers/directories.controller.js";

const router = Router();

// Read all directory
router.get("{/:id}", getDirectoryContents);

// Create directory
router.post("{/:parentDirId}", createDirectory);

// Rename directory
router.patch("/:dirId", renameDirectory);

// Delete directory
router.delete("/:id", deleteDirectory);

export default router;
