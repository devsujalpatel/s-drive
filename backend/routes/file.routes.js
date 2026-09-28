import express from "express";
import validateId from "../middlewares/validated.middleware.js";
import {
  deleteFile,
  getFile,
  updateFile,
  uploadFile,
  uploadInitiate,
} from "../controllers/file.controller.js";

const router = express.Router();

router.param("id", validateId);
router.param("parentDirId", validateId);


router.post("/upload/initiate", uploadInitiate);

// CREATE
router.post("/:id?", uploadFile);

// READ
router.get("/:id", getFile);

// UPDATE
router.patch("/:id", updateFile);

// DELETE
router.delete("/:id", deleteFile);



export default router;
