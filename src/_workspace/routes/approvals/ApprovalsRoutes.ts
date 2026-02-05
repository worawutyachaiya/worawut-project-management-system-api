import express from "express";
import { ApprovalsController } from "@controllers/approvals/ApprovalsController.js";
import { authMiddleware, authorize } from "@src/middlewares/authMiddleware.js";

const ApprovalsRoutes = express.Router();

ApprovalsRoutes.use(authMiddleware);

// Get pending approvals (Supervisor+)
ApprovalsRoutes.get(
  "/pending",
  authorize("ADMIN", "MANAGER", "SUPERVISOR"),
  ApprovalsController.getPending,
);

// Approve task (Supervisor+)
ApprovalsRoutes.post(
  "/tasks/:id/approve",
  authorize("ADMIN", "MANAGER", "SUPERVISOR"),
  ApprovalsController.approve,
);

// Reject task (Supervisor+)
ApprovalsRoutes.post(
  "/tasks/:id/reject",
  authorize("ADMIN", "MANAGER", "SUPERVISOR"),
  ApprovalsController.reject,
);

// Request revision (Supervisor+)
ApprovalsRoutes.post(
  "/tasks/:id/request-revision",
  authorize("ADMIN", "MANAGER", "SUPERVISOR"),
  ApprovalsController.requestRevision,
);

export default ApprovalsRoutes;
