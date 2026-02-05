import express from "express";
import { TasksController } from "@controllers/tasks/TasksController.js";
import { authMiddleware, authorize } from "@src/middlewares/authMiddleware.js";

const TasksRoutes = express.Router();

TasksRoutes.use(authMiddleware);

// Search tasks
TasksRoutes.post("/search", TasksController.search);
TasksRoutes.get("/", TasksController.search);

// Get task by ID
TasksRoutes.get("/:id", TasksController.findById);

// Create task
TasksRoutes.post("/", TasksController.create);

// Update task
TasksRoutes.put("/:id", TasksController.update);

// Delete task (Manager+)
TasksRoutes.delete(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  TasksController.delete,
);

// Submit for review
TasksRoutes.post("/:id/submit", TasksController.submit);

// History
// History
TasksRoutes.get("/:id/history", TasksController.getHistory);
TasksRoutes.get(
  "/:id/completion-history",
  TasksController.getCompletionHistory,
);

// Assignees
TasksRoutes.get("/:id/assignees", TasksController.getAssignees);
TasksRoutes.post(
  "/:id/assignees",
  authorize("ADMIN", "MANAGER", "SUPERVISOR"),
  TasksController.addAssignee,
);
TasksRoutes.delete(
  "/:id/assignees/:userId",
  authorize("ADMIN", "MANAGER", "SUPERVISOR"),
  TasksController.removeAssignee,
);

export default TasksRoutes;
