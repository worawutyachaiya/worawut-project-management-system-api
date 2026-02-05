import express from "express";
import { z } from "zod";
import { AuthController } from "@controllers/auth/AuthController.js";
import { validateData } from "@src/middlewares/validationMiddleware.js";
import { authMiddleware } from "@src/middlewares/authMiddleware.js";

const AuthRoutes = express.Router();

// Login
AuthRoutes.post(
  "/login",
  validateData(
    z.object({
      email: z.string().email("Valid email required"),
      password: z.string().min(1, "Password required"),
    }),
  ),
  AuthController.login,
);

// Logout
AuthRoutes.post("/logout", AuthController.logout);

// Refresh token
AuthRoutes.post("/refresh", AuthController.refresh);

// Get current user
AuthRoutes.get("/me", authMiddleware, AuthController.me);

// Change password
AuthRoutes.put(
  "/change-password",
  authMiddleware,
  validateData(
    z.object({
      oldPassword: z.string().min(1, "Current password required"),
      newPassword: z.string().min(8, "Password must be at least 8 characters"),
    }),
  ),
  AuthController.changePassword,
);

export default AuthRoutes;
