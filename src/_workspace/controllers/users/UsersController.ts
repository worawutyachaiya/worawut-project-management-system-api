import { Request, Response } from "express";
import { UsersService } from "@services/users/UsersService.js";
import { ResponseI } from "@src/types/ResponseI.js";
import { StatusCodes } from "http-status-codes";

export const UsersController = {
  search: async (req: Request, res: Response) => {
    try {
      const dataItem = req.body || req.query;
      const result = await UsersService.search(dataItem);
      const total = await UsersService.count(dataItem);

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
      const result = await UsersService.findById(Number(id));

      if (!result) {
        return res.status(StatusCodes.NOT_FOUND).json({
          Status: false,
          Message: "User not found",
          ResultOnDb: null,
          MethodOnDb: "findById",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      const roles = await UsersService.getUserRoles(Number(id));

      return res.json({
        Status: true,
        Message: "User found",
        ResultOnDb: { ...result, roles },
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
      const result = await UsersService.create(dataItem);

      return res.status(StatusCodes.CREATED).json({
        Status: true,
        Message: "User created successfully",
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
      await UsersService.update(dataItem);

      return res.json({
        Status: true,
        Message: "User updated successfully",
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
      await UsersService.delete(Number(id), req.user?.email || "system");

      return res.json({
        Status: true,
        Message: "User deleted successfully",
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

  getSubordinates: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await UsersService.getSubordinates(Number(id));

      return res.json({
        Status: true,
        Message: "Subordinates retrieved",
        ResultOnDb: result,
        MethodOnDb: "getSubordinates",
        TotalCountOnDb: result.length,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "getSubordinates",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  assignRole: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { roleId } = req.body;
      await UsersService.assignRole(Number(id), roleId, req.user?.userId || 0);

      return res.json({
        Status: true,
        Message: "Role assigned successfully",
        ResultOnDb: [],
        MethodOnDb: "assignRole",
        TotalCountOnDb: 1,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "assignRole",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  removeRole: async (req: Request, res: Response) => {
    try {
      const { id, roleId } = req.params;
      await UsersService.removeRole(Number(id), Number(roleId));

      return res.json({
        Status: true,
        Message: "Role removed successfully",
        ResultOnDb: [],
        MethodOnDb: "removeRole",
        TotalCountOnDb: 1,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "removeRole",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },
};
