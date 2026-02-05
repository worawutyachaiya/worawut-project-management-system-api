import { MySQLExecute } from "@businessData/dbExecute.js";
import { TodayJobsSQL } from "@sql/todayjobs/TodayJobsSQL.js";

export const TodayJobsService = {
  getSubordinateTasks: async (
    userId: number,
    roles: string[],
    departmentId?: number,
    dateFilter?: string,
  ) => {
    const sql = TodayJobsSQL.getSubordinateTasks(
      userId,
      roles,
      departmentId,
      dateFilter,
    );
    return await MySQLExecute.search(sql);
  },

  countSubordinateTasks: async (
    userId: number,
    roles: string[],
    departmentId?: number,
    dateFilter?: string,
  ) => {
    const sql = TodayJobsSQL.countSubordinateTasks(
      userId,
      roles,
      departmentId,
      dateFilter,
    );
    const result = await MySQLExecute.searchOne<{ total: number }>(sql);
    return result?.total || 0;
  },
};
