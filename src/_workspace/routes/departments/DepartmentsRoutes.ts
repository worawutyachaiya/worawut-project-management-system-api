import express from "express";
import { DepartmentsController } from "@controllers/departments/DepartmentsController.js";
import { authMiddleware, authorize } from "@src/middlewares/authMiddleware.js";

const DepartmentsRoutes = express.Router();

DepartmentsRoutes.use(authMiddleware);

// Search departments (all authenticated users)
DepartmentsRoutes.post("/search", DepartmentsController.search);
DepartmentsRoutes.get("/", DepartmentsController.search);

// Get hierarchy
DepartmentsRoutes.get("/hierarchy", DepartmentsController.getHierarchy);

// Get department by ID
DepartmentsRoutes.get("/:id", DepartmentsController.findById);

// Create department (Admin only)
DepartmentsRoutes.post("/", authorize("ADMIN"), DepartmentsController.create);

// Update department (Admin only)
DepartmentsRoutes.put("/:id", authorize("ADMIN"), DepartmentsController.update);

// Delete department (Admin only)
DepartmentsRoutes.delete(
  "/:id",
  authorize("ADMIN"),
  DepartmentsController.delete,
);

export default DepartmentsRoutes;
