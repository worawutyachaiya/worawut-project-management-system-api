import { Request, Response } from "express";
import { DepartmentsService } from "@services/departments/DepartmentsService.js";
import { ResponseI } from "@src/types/ResponseI.js";
import { StatusCodes } from "http-status-codes";

export const DepartmentsController = {
  search: async (req: Request, res: Response) => {
    try {
      const dataItem = req.body || req.query;
      const result = await DepartmentsService.search(dataItem);

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
      const result = await DepartmentsService.findById(Number(id));

      if (!result) {
        return res.status(StatusCodes.NOT_FOUND).json({
          Status: false,
          Message: "Department not found",
          ResultOnDb: null,
          MethodOnDb: "findById",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      return res.json({
        Status: true,
        Message: "Department found",
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

  create: async (req: Request, res: Response) => {
    try {
      const dataItem = { ...req.body, CREATE_BY: req.user?.email || "system" };
      const result = await DepartmentsService.create(dataItem);

      return res.status(StatusCodes.CREATED).json({
        Status: true,
        Message: "Department created",
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
      await DepartmentsService.update(dataItem);

      return res.json({
        Status: true,
        Message: "Department updated",
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
      await DepartmentsService.delete(Number(id), req.user?.email || "system");

      return res.json({
        Status: true,
        Message: "Department deleted",
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

  getHierarchy: async (req: Request, res: Response) => {
    try {
      const result = await DepartmentsService.getHierarchy();

      return res.json({
        Status: true,
        Message: "Hierarchy retrieved",
        ResultOnDb: result,
        MethodOnDb: "getHierarchy",
        TotalCountOnDb: result.length,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "getHierarchy",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },
};
