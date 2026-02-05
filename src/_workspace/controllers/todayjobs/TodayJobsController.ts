import { Request, Response } from "express";
import { TodayJobsService } from "@services/todayjobs/TodayJobsService.js";
import { UsersService } from "@services/users/UsersService.js";
import { ResponseI } from "@src/types/ResponseI.js";
import { StatusCodes } from "http-status-codes";

export const TodayJobsController = {
  getSubordinateTasks: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId!;
      const roles = req.user?.roles || [];
      const dateFilter = req.query.date as string | undefined;

      // Get user's department for manager filtering
      const user = await UsersService.findById(userId);
      const departmentId = user?.DEPARTMENT_ID;

      const result = await TodayJobsService.getSubordinateTasks(
        userId,
        roles,
        departmentId,
        dateFilter,
      );

      const count = await TodayJobsService.countSubordinateTasks(
        userId,
        roles,
        departmentId,
        dateFilter,
      );

      return res.json({
        Status: true,
        Message: "Subordinate tasks retrieved",
        ResultOnDb: result,
        MethodOnDb: "getSubordinateTasks",
        TotalCountOnDb: count,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "getSubordinateTasks",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },
};
