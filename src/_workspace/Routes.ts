import { Router } from "express";

import AuthRoutes from "./routes/auth/AuthRoutes.js";
import UsersRoutes from "./routes/users/UsersRoutes.js";
import DepartmentsRoutes from "./routes/departments/DepartmentsRoutes.js";
import ProjectsRoutes from "./routes/projects/ProjectsRoutes.js";
import TasksRoutes from "./routes/tasks/TasksRoutes.js";
import ApprovalsRoutes from "./routes/approvals/ApprovalsRoutes.js";
import CommentsRoutes from "./routes/comments/CommentsRoutes.js";
import FilesRoutes from "./routes/files/FilesRoutes.js";
import { TodayJobsRoutes } from "./routes/todayjobs/TodayJobsRoutes.js";

const Routers = Router();

// Public routes
Routers.use("/auth", AuthRoutes);

// Protected routes
Routers.use("/users", UsersRoutes);
Routers.use("/departments", DepartmentsRoutes);
Routers.use("/projects", ProjectsRoutes);
Routers.use("/tasks", TasksRoutes);
Routers.use("/approvals", ApprovalsRoutes);
Routers.use("/comments", CommentsRoutes);
Routers.use("/files", FilesRoutes);
Routers.use("/today-jobs", TodayJobsRoutes);

export default Routers;
