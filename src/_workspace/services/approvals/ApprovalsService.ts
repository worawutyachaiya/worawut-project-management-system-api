import { MySQLExecute } from "@businessData/dbExecute.js";
import { ApprovalsSQL } from "@sql/approvals/ApprovalsSQL.js";

export const ApprovalsService = {
  getPending: async (approverId: number) => {
    const sql = ApprovalsSQL.getPending(approverId);
    return await MySQLExecute.search(sql);
  },

  findByTaskAndApprover: async (taskId: number, approverId: number) => {
    const sql = ApprovalsSQL.findByTaskAndApprover(taskId, approverId);
    return await MySQLExecute.searchOne(sql);
  },

  create: async (
    taskId: number,
    approverId: number,
    sequenceOrder: number,
    createBy: string,
  ) => {
    const sql = ApprovalsSQL.create(
      taskId,
      approverId,
      sequenceOrder,
      createBy,
    );
    return await MySQLExecute.execute(sql);
  },

  updateStatus: async (
    approvalId: number,
    status: string,
    comments: string | null,
    updateBy: string,
  ) => {
    const sql = ApprovalsSQL.updateStatus(
      approvalId,
      status,
      comments,
      updateBy,
    );
    return await MySQLExecute.execute(sql);
  },

  getByTask: async (taskId: number) => {
    const sql = ApprovalsSQL.getByTask(taskId);
    return await MySQLExecute.search(sql);
  },

  resetForTask: async (taskId: number) => {
    const sql = ApprovalsSQL.resetForTask(taskId);
    return await MySQLExecute.execute(sql);
  },
};
