import express from "express";
import { CommentsController } from "@controllers/comments/CommentsController.js";
import { authMiddleware } from "@src/middlewares/authMiddleware.js";

const CommentsRoutes = express.Router();

CommentsRoutes.use(authMiddleware);

// Get comments for a task
CommentsRoutes.get("/tasks/:taskId", CommentsController.search);

// Add comment to task
CommentsRoutes.post("/tasks/:taskId", CommentsController.create);

// Update comment
CommentsRoutes.put("/:id", CommentsController.update);

// Delete comment
CommentsRoutes.delete("/:id", CommentsController.delete);

export default CommentsRoutes;
