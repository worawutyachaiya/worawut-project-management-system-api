import express from "express";
import { ProjectsController } from "@controllers/projects/ProjectsController.js";
import { authMiddleware, authorize } from "@src/middlewares/authMiddleware.js";

const ProjectsRoutes = express.Router();

ProjectsRoutes.use(authMiddleware);

ProjectsRoutes.post("/search", ProjectsController.search);
ProjectsRoutes.get("/", ProjectsController.search);

ProjectsRoutes.get("/:id", ProjectsController.findById);

ProjectsRoutes.post(
  "/",
  authorize("ADMIN", "MANAGER", "SUPERVISOR"),
  ProjectsController.create,
);

ProjectsRoutes.put(
  "/:id",
  authorize("ADMIN", "MANAGER", "SUPERVISOR"),
  ProjectsController.update,
);

ProjectsRoutes.delete("/:id", authorize("ADMIN"), ProjectsController.delete);

ProjectsRoutes.post(
  "/:id/finalize",
  authorize("ADMIN", "MANAGER", "SUPERVISOR"),
  ProjectsController.finalize,
);

ProjectsRoutes.get(
  "/:id/analytics",
  authorize("ADMIN", "MANAGER", "SUPERVISOR"),
  ProjectsController.getAnalytics,
);

ProjectsRoutes.get("/:id/members", ProjectsController.getMembers);
ProjectsRoutes.post(
  "/:id/members",
  authorize("ADMIN", "MANAGER", "SUPERVISOR"),
  ProjectsController.addMember,
);
ProjectsRoutes.delete(
  "/:id/members/:userId",
  authorize("ADMIN", "MANAGER", "SUPERVISOR"),
  ProjectsController.removeMember,
);

export default ProjectsRoutes;
