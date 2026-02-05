import { MySQLExecute } from "@businessData/dbExecute.js";
import { FilesSQL } from "@sql/files/FilesSQL.js";

export const FilesService = {
  search: async (taskId: number) => {
    const sql = FilesSQL.search(taskId);
    return await MySQLExecute.search(sql);
  },

  findById: async (id: number) => {
    const sql = FilesSQL.findById(id);
    return await MySQLExecute.searchOne(sql);
  },

  create: async (dataItem: any) => {
    const sql = FilesSQL.create(dataItem);
    return await MySQLExecute.execute(sql);
  },

  delete: async (id: number, deleteBy: string) => {
    const sql = FilesSQL.delete(id, deleteBy);
    return await MySQLExecute.execute(sql);
  },
};
