import { Router } from "express";
import {
  createDirectory,
  getDirectoryContents,
} from "../controllers/directories.controller.js";

const router = Router();

// Read all directory
router.get("{/:id}", getDirectoryContents);

// Create directory
router.post("{/:parentDirId}", createDirectory);

export default router;
