import express from "express";

import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getPublicProject,
} from "../controllers/projectController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/public/:slug", getPublicProject);

router.use(authMiddleware);

router.get("/", getProjects);

router.post("/", createProject);

router.get("/:id", getProjectById);

router.put("/:id", updateProject);

router.delete("/:id", deleteProject);

export default router;