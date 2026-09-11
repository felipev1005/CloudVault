import { Router } from "express";
import {
  getCurrentUser,
  login,
  register,
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getCurrentUser);

export default router;