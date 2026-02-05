import { Request, Response } from "express";
import { ApprovalsService } from "@services/approvals/ApprovalsService.js";
import { TasksService } from "@services/tasks/TasksService.js";
import { ResponseI } from "@src/types/ResponseI.js";
import { StatusCodes } from "http-status-codes";

export const ApprovalsController = {
  getPending: async (req: Request, res: Response) => {
    try {
      console.log("=== GET PENDING APPROVALS ===");
      console.log("Viewer userId:", req.user?.userId);
      console.log("Viewer email:", req.user?.email);

      const result = await ApprovalsService.getPending(req.user?.userId!);

      console.log("Approvals found:", result.length);
      console.log("Results:", JSON.stringify(result, null, 2));
      console.log("=============================");

      return res.json({
        Status: true,
        Message: "Pending approvals retrieved",
        ResultOnDb: result,
        MethodOnDb: "getPending",
        TotalCountOnDb: result.length,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "getPending",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  approve: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;

      const approval = await ApprovalsService.findByTaskAndApprover(
        Number(id),
        req.user?.userId!,
      );
      if (!approval) {
        return res.status(StatusCodes.FORBIDDEN).json({
          Status: false,
          Message: "No pending approval for this task",
          ResultOnDb: [],
          MethodOnDb: "approve",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      await ApprovalsService.updateStatus(
        approval.ID,
        "APPROVED",
        comments,
        req.user?.email || "system",
      );
      await TasksService.updateStatus(
        Number(id),
        "APPROVED",
        req.user?.email || "system",
      );

      const ip = req.ip || req.socket.remoteAddress || "";
      await TasksService.addHistory(
        Number(id),
        req.user?.userId!,
        "APPROVED",
        "STATUS",
        "PENDING_REVIEW",
        "APPROVED",
        ip,
      );

      return res.json({
        Status: true,
        Message: "Task approved",
        ResultOnDb: [],
        MethodOnDb: "approve",
        TotalCountOnDb: 1,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "approve",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  reject: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;

      const approval = await ApprovalsService.findByTaskAndApprover(
        Number(id),
        req.user?.userId!,
      );
      if (!approval) {
        return res.status(StatusCodes.FORBIDDEN).json({
          Status: false,
          Message: "No pending approval for this task",
          ResultOnDb: [],
          MethodOnDb: "reject",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      await ApprovalsService.updateStatus(
        approval.ID,
        "REJECTED",
        comments,
        req.user?.email || "system",
      );
      await TasksService.updateStatus(
        Number(id),
        "REJECTED",
        req.user?.email || "system",
      );

      const ip = req.ip || req.socket.remoteAddress || "";
      await TasksService.addHistory(
        Number(id),
        req.user?.userId!,
        "REJECTED",
        "STATUS",
        "PENDING_REVIEW",
        "REJECTED",
        ip,
      );

      return res.json({
        Status: true,
        Message: "Task rejected",
        ResultOnDb: [],
        MethodOnDb: "reject",
        TotalCountOnDb: 1,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "reject",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  requestRevision: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;

      const approval = await ApprovalsService.findByTaskAndApprover(
        Number(id),
        req.user?.userId!,
      );
      if (!approval) {
        return res.status(StatusCodes.FORBIDDEN).json({
          Status: false,
          Message: "No pending approval for this task",
          ResultOnDb: [],
          MethodOnDb: "requestRevision",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      await ApprovalsService.updateStatus(
        approval.ID,
        "REVISION_REQUESTED",
        comments,
        req.user?.email || "system",
      );
      await TasksService.updateStatus(
        Number(id),
        "REVISION_REQUESTED",
        req.user?.email || "system",
      );

      const ip = req.ip || req.socket.remoteAddress || "";
      await TasksService.addHistory(
        Number(id),
        req.user?.userId!,
        "REVISION_REQUESTED",
        "STATUS",
        "PENDING_REVIEW",
        "REVISION_REQUESTED",
        ip,
      );

      return res.json({
        Status: true,
        Message: "Revision requested",
        ResultOnDb: [],
        MethodOnDb: "requestRevision",
        TotalCountOnDb: 1,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "requestRevision",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },
};
