import { Request, Response } from "express";
import { CommentsService } from "@services/comments/CommentsService.js";
import { TasksService } from "@services/tasks/TasksService.js";
import { ResponseI } from "@src/types/ResponseI.js";
import { StatusCodes } from "http-status-codes";

export const CommentsController = {
  search: async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;
      const result = await CommentsService.search(Number(taskId));

      return res.json({
        Status: true,
        Message: "Comments retrieved",
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

  create: async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;
      const dataItem = {
        ...req.body,
        TASK_ID: Number(taskId),
        USER_ID: req.user?.userId,
        CREATE_BY: req.user?.email || "system",
      };
      const result = await CommentsService.create(dataItem);

      const ip = req.ip || req.socket.remoteAddress || "";
      await TasksService.addHistory(
        Number(taskId),
        req.user?.userId!,
        "COMMENTED",
        null,
        null,
        null,
        ip,
      );

      return res.status(StatusCodes.CREATED).json({
        Status: true,
        Message: "Comment added",
        ResultOnDb: { insertId: result.insertId },
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
      const { content } = req.body;

      const comment = await CommentsService.findById(Number(id));
      if (!comment || comment.USER_ID !== req.user?.userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          Status: false,
          Message: "Cannot edit this comment",
          ResultOnDb: [],
          MethodOnDb: "update",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      await CommentsService.update(
        Number(id),
        content,
        req.user?.email || "system",
      );

      return res.json({
        Status: true,
        Message: "Comment updated",
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

      const comment = await CommentsService.findById(Number(id));
      if (
        !comment ||
        (comment.USER_ID !== req.user?.userId &&
          !req.user?.roles.includes("ADMIN"))
      ) {
        return res.status(StatusCodes.FORBIDDEN).json({
          Status: false,
          Message: "Cannot delete this comment",
          ResultOnDb: [],
          MethodOnDb: "delete",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      await CommentsService.delete(Number(id), req.user?.email || "system");

      return res.json({
        Status: true,
        Message: "Comment deleted",
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
};
