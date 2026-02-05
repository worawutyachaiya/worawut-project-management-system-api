import { MySQLExecute } from "@businessData/dbExecute.js";
import { DepartmentsSQL } from "@sql/departments/DepartmentsSQL.js";

export const DepartmentsService = {
  search: async (dataItem: any) => {
    const sql = DepartmentsSQL.search(dataItem);
    return await MySQLExecute.search(sql);
  },

  findById: async (id: number) => {
    const sql = DepartmentsSQL.findById(id);
    return await MySQLExecute.searchOne(sql);
  },

  create: async (dataItem: any) => {
    const sql = DepartmentsSQL.create(dataItem);
    return await MySQLExecute.execute(sql);
  },

  update: async (dataItem: any) => {
    const sql = DepartmentsSQL.update(dataItem);
    return await MySQLExecute.execute(sql);
  },

  delete: async (id: number, deleteBy: string) => {
    const sql = DepartmentsSQL.delete(id, deleteBy);
    return await MySQLExecute.execute(sql);
  },

  getHierarchy: async () => {
    const sql = DepartmentsSQL.getHierarchy();
    return await MySQLExecute.search(sql);
  },
};
