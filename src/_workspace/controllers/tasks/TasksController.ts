import { Request, Response } from "express";
import { TasksService } from "@services/tasks/TasksService.js";
import { ApprovalsService } from "@services/approvals/ApprovalsService.js";
import { ProjectsService } from "@services/projects/ProjectsService.js";
import { ResponseI } from "@src/types/ResponseI.js";
import { StatusCodes } from "http-status-codes";

export const TasksController = {
  search: async (req: Request, res: Response) => {
    try {
      const dataItem = { ...req.body, ...req.query };
      const result = await TasksService.search(dataItem);

      return res.json({
        Status: true,
        Message: "Search successful",
        ResultOnDb: result,
        MethodOnDb: "search",
        TotalCountOnDb: result.length,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "search",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  findById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await TasksService.findById(Number(id));

      if (!result) {
        return res.status(StatusCodes.NOT_FOUND).json({
          Status: false,
          Message: "Task not found",
          ResultOnDb: null,
          MethodOnDb: "findById",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      const assignees = await TasksService.getAssignees(Number(id));
      const approvals = await ApprovalsService.getByTask(Number(id));

      return res.json({
        Status: true,
        Message: "Task found",
        ResultOnDb: { ...result, assignees, approvals },
        MethodOnDb: "findById",
        TotalCountOnDb: 1,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: null,
        MethodOnDb: "findById",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const project = await ProjectsService.findById(req.body.PROJECT_ID);
      if (!project) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          Status: false,
          Message: "Project not found",
          ResultOnDb: [],
          MethodOnDb: "create",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      const taskCode = await TasksService.generateCode(project.CODE);
      const dataItem = {
        ...req.body,
        CODE: taskCode,
        CREATED_BY_ID: req.user?.userId,
        CREATE_BY: req.user?.email || "system",
      };

      const result = await TasksService.create(dataItem);
      const taskId = result.insertId;

      // Add creator as primary assignee
      await TasksService.addAssignee(
        taskId,
        req.user?.userId!,
        req.user?.userId!,
        true,
      );

      // Log history
      const ip = req.ip || req.socket.remoteAddress || "";
      await TasksService.addHistory(
        taskId,
        req.user?.userId!,
        "CREATED",
        null,
        null,
        null,
        ip,
      );

      return res.status(StatusCodes.CREATED).json({
        Status: true,
        Message: "Task created",
        ResultOnDb: { insertId: taskId, CODE: taskCode },
        MethodOnDb: "create",
        TotalCountOnDb: 1,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "create",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const dataItem = {
        ...req.body,
        ID: Number(id),
        UPDATE_BY: req.user?.email || "system",
      };

      const previousTask = await TasksService.findById(Number(id));

      await TasksService.update(dataItem);

      if (
        dataItem.STATUS === "PENDING_REVIEW" &&
        previousTask?.STATUS !== "PENDING_REVIEW"
      ) {
        const existingApprovals = await ApprovalsService.getByTask(Number(id));
        const hasPending = existingApprovals.some(
          (a) => a.STATUS === "PENDING",
        );

        if (!hasPending) {
          let approverId = previousTask?.CREATED_BY_ID;

          console.log("=== APPROVAL DEBUG ===");
          console.log("Task ID:", id);
          console.log("Submitter userId:", req.user?.userId);
          console.log("Task CREATED_BY_ID:", previousTask?.CREATED_BY_ID);
          console.log("Initial approverId:", approverId);

          if (approverId === req.user?.userId) {
            const currentUser =
              await import("@services/users/UsersService.js").then((m) =>
                m.UsersService.findById(req.user?.userId!),
              );
            console.log(
              "Self-created task, user SUPERVISOR_ID:",
              currentUser?.SUPERVISOR_ID,
            );
            approverId = currentUser?.SUPERVISOR_ID || req.user?.userId;
          }

          console.log("Final approverId:", approverId);

          await ApprovalsService.create(
            Number(id),
            approverId,
            1,
            req.user?.email || "system",
          );
          console.log("Approval created successfully!");
          console.log("======================");
        }
      }

      // Trigger History Snapshot if Re-opening (COMPLETED -> Active)
      if (
        previousTask?.STATUS === "COMPLETED" &&
        dataItem.STATUS !== "COMPLETED"
      ) {
        // Try to find who completed it
        const history = await TasksService.getHistory(Number(id));
        const completionEvent = history.find(
          (h: any) => h.NEW_VALUE === "COMPLETED" && h.ACTION === "STATUS",
        );
        const completedById = completionEvent?.USER_ID || req.user?.userId!;

        await TasksService.logCompletionHistory(Number(id), completedById);
      }

      const ip = req.ip || req.socket.remoteAddress || "";
      await TasksService.addHistory(
        Number(id),
        req.user?.userId!,
        "UPDATED",
        null,
        previousTask?.STATUS || null,
        dataItem.STATUS || null,
        ip,
      );

      return res.json({
        Status: true,
        Message: "Task updated",
        ResultOnDb: [],
        MethodOnDb: "update",
        TotalCountOnDb: 1,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "update",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await TasksService.delete(Number(id), req.user?.email || "system");

      return res.json({
        Status: true,
        Message: "Task deleted",
        ResultOnDb: [],
        MethodOnDb: "delete",
        TotalCountOnDb: 1,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "delete",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  submit: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await TasksService.updateStatus(
        Number(id),
        "PENDING_REVIEW",
        req.user?.email || "system",
      );

      // Get task to find the creator
      const task = await TasksService.findById(Number(id));

      // Assign approval to TASK CREATOR
      // If submitter is the creator, use their supervisor instead
      let approverId = task?.CREATED_BY_ID;

      if (approverId === req.user?.userId) {
        // Self-created task: route to supervisor
        const currentUser =
          await import("@services/users/UsersService.js").then((m) =>
            m.UsersService.findById(req.user?.userId!),
          );
        approverId = currentUser?.SUPERVISOR_ID || req.user?.userId;
      }

      await ApprovalsService.create(
        Number(id),
        approverId,
        1,
        req.user?.email || "system",
      );

      const ip = req.ip || req.socket.remoteAddress || "";
      await TasksService.addHistory(
        Number(id),
        req.user?.userId!,
        "SUBMITTED",
        "STATUS",
        "IN_PROGRESS",
        "PENDING_REVIEW",
        ip,
      );

      return res.json({
        Status: true,
        Message: "Task submitted for review",
        ResultOnDb: [],
        MethodOnDb: "submit",
        TotalCountOnDb: 1,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "submit",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  getHistory: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await TasksService.getHistory(Number(id));

      return res.json({
        Status: true,
        Message: "History retrieved",
        ResultOnDb: result,
        MethodOnDb: "getHistory",
        TotalCountOnDb: result.length,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "getHistory",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  getAssignees: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await TasksService.getAssignees(Number(id));

      return res.json({
        Status: true,
        Message: "Assignees retrieved",
        ResultOnDb: result,
        MethodOnDb: "getAssignees",
        TotalCountOnDb: result.length,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "getAssignees",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  addAssignee: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { userId, isPrimary } = req.body;
      await TasksService.addAssignee(
        Number(id),
        userId,
        req.user?.userId!,
        isPrimary,
      );

      const ip = req.ip || req.socket.remoteAddress || "";
      await TasksService.addHistory(
        Number(id),
        req.user?.userId!,
        "ASSIGNED",
        null,
        null,
        String(userId),
        ip,
      );

      return res.json({
        Status: true,
        Message: "Assignee added",
        ResultOnDb: [],
        MethodOnDb: "addAssignee",
        TotalCountOnDb: 1,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "addAssignee",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  removeAssignee: async (req: Request, res: Response) => {
    try {
      const { id, userId } = req.params;
      await TasksService.removeAssignee(Number(id), Number(userId));

      const ip = req.ip || req.socket.remoteAddress || "";
      await TasksService.addHistory(
        Number(id),
        req.user?.userId!,
        "UNASSIGNED",
        null,
        userId,
        null,
        ip,
      );

      return res.json({
        Status: true,
        Message: "Assignee removed",
        ResultOnDb: [],
        MethodOnDb: "removeAssignee",
        TotalCountOnDb: 1,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "removeAssignee",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  getCompletionHistory: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await TasksService.getCompletionLogs(Number(id));

      return res.json({
        Status: true,
        Message: "Completion history retrieved",
        ResultOnDb: result,
        MethodOnDb: "getCompletionHistory",
        TotalCountOnDb: result.length,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "getCompletionHistory",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },
};
