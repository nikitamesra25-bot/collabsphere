import express from "express";

import {
  register,
  login,
  getMe,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// User registration
router.post("/register", register);

// User login
router.post("/login", login);

// Get logged-in user details
router.get("/me", authMiddleware, getMe);

export default router;