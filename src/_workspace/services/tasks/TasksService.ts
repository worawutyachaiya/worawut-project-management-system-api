import { MySQLExecute } from "@businessData/dbExecute.js";
import { TasksSQL } from "@sql/tasks/TasksSQL.js";
import { CommentsService } from "@services/comments/CommentsService.js";
import { FilesService } from "@services/files/FilesService.js";

export const TasksService = {
  search: async (dataItem: any) => {
    const sql = TasksSQL.search(dataItem);
    return await MySQLExecute.search(sql);
  },

  findById: async (id: number) => {
    const sql = TasksSQL.findById(id);
    return await MySQLExecute.searchOne(sql);
  },

  create: async (dataItem: any) => {
    const sql = TasksSQL.create(dataItem);
    return await MySQLExecute.execute(sql);
  },

  update: async (dataItem: any) => {
    const sql = TasksSQL.update(dataItem);
    return await MySQLExecute.execute(sql);
  },

  updateStatus: async (taskId: number, status: string, updateBy: string) => {
    const sql = TasksSQL.updateStatus(taskId, status, updateBy);
    return await MySQLExecute.execute(sql);
  },

  delete: async (id: number, deleteBy: string) => {
    const sql = TasksSQL.delete(id, deleteBy);
    return await MySQLExecute.execute(sql);
  },

  getAssignees: async (taskId: number) => {
    const sql = TasksSQL.getAssignees(taskId);
    return await MySQLExecute.search(sql);
  },

  addAssignee: async (
    taskId: number,
    userId: number,
    assignedBy: number,
    isPrimary: boolean = false,
  ) => {
    const sql = TasksSQL.addAssignee(taskId, userId, assignedBy, isPrimary);
    return await MySQLExecute.execute(sql);
  },

  removeAssignee: async (taskId: number, userId: number) => {
    const sql = TasksSQL.removeAssignee(taskId, userId);
    return await MySQLExecute.execute(sql);
  },

  addHistory: async (
    taskId: number,
    userId: number,
    action: string,
    fieldName: string | null,
    oldValue: string | null,
    newValue: string | null,
    ipAddress: string,
  ) => {
    const sql = TasksSQL.addHistory(
      taskId,
      userId,
      action,
      fieldName,
      oldValue,
      newValue,
      ipAddress,
    );
    return await MySQLExecute.execute(sql);
  },

  getHistory: async (taskId: number) => {
    const sql = TasksSQL.getHistory(taskId);
    return await MySQLExecute.search(sql);
  },

  generateCode: async (projectCode: string) => {
    const sql = TasksSQL.generateCode(projectCode);
    const result = await MySQLExecute.searchOne<{ new_code: string }>(sql);
    return result?.new_code || `${projectCode}-0001`;
  },

  logCompletionHistory: async (taskId: number, completedById: number) => {
    // 1. Get Task Data
    const task = await TasksService.findById(taskId);
    if (!task) return false;

    // 2. Get Comments & Files
    const comments = await CommentsService.search(taskId);
    const files = await FilesService.search(taskId);

    // 3. Prepare Snapshot
    const snapshot = {
      description: task.DESCRIPTION,
      comments: comments || [],
      files: files || [],
    };

    // 4. Calculate Duration (Hours)
    const startDate = new Date(task.CREATE_DATE);
    const endDate = task.COMPLETED_DATE
      ? new Date(task.COMPLETED_DATE)
      : new Date();
    const durationHours =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

    // 5. Save to Log
    const sql = TasksSQL.createCompletionLog(
      taskId,
      endDate.toISOString().slice(0, 19).replace("T", " "),
      completedById,
      Number(durationHours.toFixed(2)),
      JSON.stringify(snapshot),
    );

    return await MySQLExecute.execute(sql);
  },

  getCompletionLogs: async (taskId: number) => {
    const sql = TasksSQL.getCompletionLogs(taskId);
    const logs = await MySQLExecute.search(sql);

    // Parse JSON snapshot
    return logs.map((log: any) => ({
      ...log,
      SNAPSHOT_DATA:
        typeof log.SNAPSHOT_DATA === "string"
          ? JSON.parse(log.SNAPSHOT_DATA)
          : log.SNAPSHOT_DATA,
    }));
  },
};
