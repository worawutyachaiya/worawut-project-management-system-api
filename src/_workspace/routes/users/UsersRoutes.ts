import express from "express";
import { UsersController } from "@controllers/users/UsersController.js";
import { authMiddleware, authorize } from "@src/middlewares/authMiddleware.js";

const UsersRoutes = express.Router();

// All routes require authentication
UsersRoutes.use(authMiddleware);

// Search users (Admin only)
UsersRoutes.post("/search", authorize("ADMIN"), UsersController.search);
UsersRoutes.get("/", authorize("ADMIN"), UsersController.search);

// Get user by ID
UsersRoutes.get("/:id", authorize("ADMIN"), UsersController.findById);

// Create user (Admin only)
UsersRoutes.post("/", authorize("ADMIN"), UsersController.create);

// Update user (Admin only)
UsersRoutes.put("/:id", authorize("ADMIN"), UsersController.update);

// Delete user (Admin only)
UsersRoutes.delete("/:id", authorize("ADMIN"), UsersController.delete);

// Get subordinates (Supervisor+)
UsersRoutes.get(
  "/:id/subordinates",
  authorize("ADMIN", "MANAGER", "SUPERVISOR"),
  UsersController.getSubordinates,
);

// Role management (Admin only)
UsersRoutes.post("/:id/roles", authorize("ADMIN"), UsersController.assignRole);
UsersRoutes.delete(
  "/:id/roles/:roleId",
  authorize("ADMIN"),
  UsersController.removeRole,
);

export default UsersRoutes;
