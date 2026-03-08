import { Router } from "express";
import {
  createDirectory,
  getDirectoryContents,
} from "../controllers/directories.controller.js";

const router = Router();

// Read all directory
router.get("/", getDirectoryContents);

// Create directory
router.post("/", createDirectory);

export default router;
