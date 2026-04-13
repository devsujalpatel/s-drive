import express from "express";
import validateId from "../middlewares/validated.middleware.js";
import {
  createDirectory,
  deleteDirectory,
  getDirectory,
  updateDirectory,
} from "../controllers/directory.controller.js";

const router = express.Router();

router.param("id", validateId);
router.param("parentDirId", validateId);

// Create
router.post("/:id?", createDirectory);

// Read
router.get("/:id?", getDirectory);

// Update
router.patch("/:id", updateDirectory);

// Delete
router.delete("/:id", deleteDirectory);

export default router;
