import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface AuthTokenPayload {
  userId: number;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      message: "Authorization token is required",
    });
    return;
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    res.status(401).json({
      message: "Invalid authorization format",
    });
    return;
  }

  const token = parts[1];

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    res.status(500).json({
      message: "Authentication configuration error",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthTokenPayload;

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        message: "Token has expired",
      });
      return;
    }

    res.status(401).json({
      message: "Invalid token",
    });
  }
};