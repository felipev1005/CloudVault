import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";

import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../services/authService.js";

import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

const SALT_ROUNDS = 12;

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({
        message: "Name, email, and password are required",
      });
      return;
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      res.status(400).json({
        message: "Name, email, and password are required",
      });
      return;
    }

    if (cleanName.length < 2 || cleanName.length > 100) {
      res.status(400).json({
        message: "Name must be between 2 and 100 characters",
      });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      res.status(400).json({
        message: "Please provide a valid email address",
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
      return;
    }

    const existingUser = await findUserByEmail(cleanEmail);

    if (existingUser) {
      res.status(409).json({
        message: "An account with this email already exists",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await createUser({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
    });

    res.status(201).json({
      message: "Account created successfully",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Unable to create account",
    });
  }
};

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({
        message: "Email and password are required",
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      res.status(400).json({
        message: "Email and password are required",
      });
      return;
    }

    const user = await findUserByEmail(cleanEmail);

    if (!user) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const expiresIn = (process.env.JWT_EXPIRES_IN ||
      "1h") as SignOptions["expiresIn"];

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      jwtSecret,
      {
        expiresIn,
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Unable to log in",
    });
  }
};

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    const user = await findUserById(req.user.userId);

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    res.status(500).json({
      message: "Unable to retrieve user",
    });
  }
};