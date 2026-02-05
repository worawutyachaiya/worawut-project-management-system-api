import { Request, Response } from "express";
import { FilesService } from "@services/files/FilesService.js";
import { TasksService } from "@services/tasks/TasksService.js";
import { ResponseI } from "@src/types/ResponseI.js";
import { StatusCodes } from "http-status-codes";

export const FilesController = {
  search: async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;
      const result = await FilesService.search(Number(taskId));

      return res.json({
        Status: true,
        Message: "Files retrieved",
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

  upload: async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          Status: false,
          Message: "No file uploaded",
          ResultOnDb: [],
          MethodOnDb: "upload",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      // In production, upload to Cloudinary/S3 and get URL
      // For now, we'll save file info with a placeholder URL
      const dataItem = {
        TASK_ID: Number(taskId),
        FILE_NAME: file.filename || file.originalname, // Cloudinary public_id or original name
        ORIGINAL_NAME: file.originalname,
        FILE_TYPE: file.mimetype.split("/")[1] || "unknown",
        FILE_SIZE: file.size,
        MIME_TYPE: file.mimetype,
        STORAGE_URL: file.path, // Cloudinary URL
        CATEGORY: req.body.category || "ATTACHMENT",
        UPLOADED_BY_ID: req.user?.userId,
        CREATE_BY: req.user?.email || "system",
      };

      const result = await FilesService.create(dataItem);

      const ip = req.ip || req.socket.remoteAddress || "";
      await TasksService.addHistory(
        Number(taskId),
        req.user?.userId!,
        "FILE_UPLOADED",
        null,
        null,
        file.originalname,
        ip,
      );

      return res.status(StatusCodes.CREATED).json({
        Status: true,
        Message: "File uploaded",
        ResultOnDb: { insertId: result.insertId },
        MethodOnDb: "upload",
        TotalCountOnDb: 1,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "upload",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  findById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await FilesService.findById(Number(id));

      if (!result) {
        return res.status(StatusCodes.NOT_FOUND).json({
          Status: false,
          Message: "File not found",
          ResultOnDb: null,
          MethodOnDb: "findById",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      return res.json({
        Status: true,
        Message: "File found",
        ResultOnDb: result,
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

  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const file = await FilesService.findById(Number(id));
      if (
        !file ||
        (file.UPLOADED_BY_ID !== req.user?.userId &&
          !req.user?.roles.includes("ADMIN"))
      ) {
        return res.status(StatusCodes.FORBIDDEN).json({
          Status: false,
          Message: "Cannot delete this file",
          ResultOnDb: [],
          MethodOnDb: "delete",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      // In production, delete from Cloudinary/S3 as well
      await FilesService.delete(Number(id), req.user?.email || "system");

      const ip = req.ip || req.socket.remoteAddress || "";
      await TasksService.addHistory(
        file.TASK_ID,
        req.user?.userId!,
        "FILE_DELETED",
        null,
        file.ORIGINAL_NAME,
        null,
        ip,
      );

      return res.json({
        Status: true,
        Message: "File deleted",
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
