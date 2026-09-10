import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  createUser,
  findUserByEmail,
} from "../services/authService.js";

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