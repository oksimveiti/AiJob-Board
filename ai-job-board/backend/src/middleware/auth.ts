import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest, ApiResponse } from "../types";

export const authenticateUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.headers["x-user-id"] as string;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "User ID is required",
    } as ApiResponse);
  }

  req.user = {
    id: userId,
    email: `user-${userId}@example.com`,
    name: `User ${userId}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  next();
};
