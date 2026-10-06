import express from "express";
import validateId from "../middlewares/validated.middleware.js";
import {
  deleteFile,
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


// READ
router.get("/:id", getFile);

// UPDATE
router.patch("/:id", updateFile);

// DELETE
router.delete("/:id", deleteFile);



export default router;
