import express from "express";
import validateId from "../middlewares/validated.middleware.js";
import {
  deleteFile,
  cancelUpload,
  completeUpload,
  getFile,
  updateFile,
  uploadInitiate,
} from "../controllers/file.controller.js";

const router = express.Router();

router.param("id", validateId);
router.param("parentDirId", validateId);


// Create
router.post("/upload/initiate", uploadInitiate);
router.post("/upload/:id/complete", completeUpload);
router.delete("/upload/:id", cancelUpload);


// READ
router.get("/:id", getFile);

// UPDATE
router.patch("/:id", updateFile);

// DELETE
router.delete("/:id", deleteFile);



export default router;
