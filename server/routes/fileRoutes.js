import express from "express";

import {
  getFiles,
  uploadFile,
  deleteFile,
  upload,
} from "../controllers/fileController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Authentication required
router.use(authMiddleware);

// Get all files of a project
router.get("/:projectId", getFiles);

// Upload a file
router.post("/upload", upload.single("file"), uploadFile);

// Delete a file
router.delete("/:id", deleteFile);

export default router;