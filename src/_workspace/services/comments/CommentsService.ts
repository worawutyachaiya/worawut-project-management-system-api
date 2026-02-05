import { MySQLExecute } from "@businessData/dbExecute.js";
import { CommentsSQL } from "@sql/comments/CommentsSQL.js";

export const CommentsService = {
  search: async (taskId: number) => {
    const sql = CommentsSQL.search(taskId);
    return await MySQLExecute.search(sql);
  },

  findById: async (id: number) => {
    const sql = CommentsSQL.findById(id);
    return await MySQLExecute.searchOne(sql);
  },

  create: async (dataItem: any) => {
    const sql = CommentsSQL.create(dataItem);
    return await MySQLExecute.execute(sql);
  },

  update: async (id: number, content: string, updateBy: string) => {
    const sql = CommentsSQL.update(id, content, updateBy);
    return await MySQLExecute.execute(sql);
  },

  delete: async (id: number, deleteBy: string) => {
    const sql = CommentsSQL.delete(id, deleteBy);
    return await MySQLExecute.execute(sql);
  },
};
