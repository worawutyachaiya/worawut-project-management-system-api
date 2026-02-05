import { Request, Response } from "express";
import { ProjectsService } from "@services/projects/ProjectsService.js";
import { ResponseI } from "@src/types/ResponseI.js";
import { StatusCodes } from "http-status-codes";

export const ProjectsController = {
  search: async (req: Request, res: Response) => {
    try {
      const dataItem = { ...req.body, ...req.query };
      // Scope to user's projects unless admin
      if (!req.user?.roles.includes("ADMIN")) {
        dataItem.MEMBER_ID = req.user?.userId;
      }

      const result = await ProjectsService.search(dataItem);
      const total = await ProjectsService.count(dataItem);

      return res.json({
        Status: true,
        Message: "Search successful",
        ResultOnDb: result,
        MethodOnDb: "search",
        TotalCountOnDb: total,
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
      const result = await ProjectsService.findById(Number(id));

      if (!result) {
        return res.status(StatusCodes.NOT_FOUND).json({
          Status: false,
          Message: "Project not found",
          ResultOnDb: null,
          MethodOnDb: "findById",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      const members = await ProjectsService.getMembers(Number(id));

      return res.json({
        Status: true,
        Message: "Project found",
        ResultOnDb: { ...result, members },
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
      const dataItem = {
        ...req.body,
        OWNER_ID: req.user?.userId,
        CREATE_BY: req.user?.email || "system",
      };
      const result = await ProjectsService.create(dataItem);

      return res.status(StatusCodes.CREATED).json({
        Status: true,
        Message: "Project created",
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
      const dataItem = {
        ...req.body,
        ID: Number(id),
        UPDATE_BY: req.user?.email || "system",
      };
      await ProjectsService.update(dataItem);

      return res.json({
        Status: true,
        Message: "Project updated",
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
      await ProjectsService.delete(Number(id), req.user?.email || "system");

      return res.json({
        Status: true,
        Message: "Project deleted",
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

  getMembers: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await ProjectsService.getMembers(Number(id));

      return res.json({
        Status: true,
        Message: "Members retrieved",
        ResultOnDb: result,
        MethodOnDb: "getMembers",
        TotalCountOnDb: result.length,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "getMembers",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  addMember: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { userId, role } = req.body;
      await ProjectsService.addMember(Number(id), userId, role);

      return res.json({
        Status: true,
        Message: "Member added",
        ResultOnDb: [],
        MethodOnDb: "addMember",
        TotalCountOnDb: 1,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "addMember",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  removeMember: async (req: Request, res: Response) => {
    try {
      const { id, userId } = req.params;
      await ProjectsService.removeMember(Number(id), Number(userId));

      return res.json({
        Status: true,
        Message: "Member removed",
        ResultOnDb: [],
        MethodOnDb: "removeMember",
        TotalCountOnDb: 1,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "removeMember",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  finalize: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await ProjectsService.finalize(Number(id), req.user?.email || "system");

      return res.json({
        Status: true,
        Message: "Project finalized",
        ResultOnDb: [],
        MethodOnDb: "finalize",
        TotalCountOnDb: 1,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "finalize",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  getAnalytics: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await ProjectsService.getAnalytics(Number(id));

      return res.json({
        Status: true,
        Message: "Analytics retrieved",
        ResultOnDb: result,
        MethodOnDb: "getAnalytics",
        TotalCountOnDb: 1,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: null,
        MethodOnDb: "getAnalytics",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },
};
