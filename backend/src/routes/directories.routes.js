import { Router } from "express";
import {
  createDirectory,
  getDirectoryContents,
} from "../controllers/directories.controller.js";

const router = Router();

router.get("/?*", getDirectoryContents);

router.post("/?*", createDirectory);

export default router;
