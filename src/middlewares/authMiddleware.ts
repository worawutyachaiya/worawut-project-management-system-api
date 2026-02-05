import { Request, Response, NextFunction } from "express";
import { JWTHelper, TokenPayload } from "@src/utils/jwt.js";
import { ResponseI } from "@src/types/ResponseI.js";
import { StatusCodes } from "http-status-codes";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      Status: false,
      Message: "Access token required",
      ResultOnDb: [],
      MethodOnDb: "authMiddleware",
      TotalCountOnDb: 0,
    } as ResponseI);
  }

  const token = authHeader.split(" ")[1];
  const payload = JWTHelper.verifyAccessToken(token);

  if (!payload) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      Status: false,
      Message: "Invalid or expired token",
      ResultOnDb: [],
      MethodOnDb: "authMiddleware",
      TotalCountOnDb: 0,
    } as ResponseI);
  }

  req.user = payload;
  next();
};

// Role-based authorization middleware
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        Status: false,
        Message: "Authentication required",
        ResultOnDb: [],
        MethodOnDb: "authorize",
        TotalCountOnDb: 0,
      } as ResponseI);
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return res.status(StatusCodes.FORBIDDEN).json({
        Status: false,
        Message: "Insufficient permissions",
        ResultOnDb: [],
        MethodOnDb: "authorize",
        TotalCountOnDb: 0,
      } as ResponseI);
    }

    next();
  };
};

// Optional auth - sets user if token exists, continues without error if not
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const payload = JWTHelper.verifyAccessToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
};
