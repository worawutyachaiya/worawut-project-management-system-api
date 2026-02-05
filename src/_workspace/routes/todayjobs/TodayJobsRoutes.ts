import { Router } from "express";
import { TodayJobsController } from "@controllers/todayjobs/TodayJobsController.js";
import { authMiddleware, authorize } from "@src/middlewares/authMiddleware.js";

export const TodayJobsRoutes = Router();

TodayJobsRoutes.use(authMiddleware);

// Only SUPERVISOR, MANAGER, ADMIN can access subordinate tasks
// Query params: ?date=YYYY-MM-DD (optional)
TodayJobsRoutes.get(
  "/",
  authorize("ADMIN", "MANAGER", "SUPERVISOR"),
  TodayJobsController.getSubordinateTasks,
);
