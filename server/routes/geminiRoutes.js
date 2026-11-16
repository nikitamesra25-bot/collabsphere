import express from "express";

import { askGemini } from "../controllers/geminiController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Authentication required
router.use(authMiddleware);

// Ask Gemini AI
router.post("/ask", askGemini);

export default router;