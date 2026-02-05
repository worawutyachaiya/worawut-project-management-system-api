import { MySQLExecute } from "@businessData/dbExecute.js";
import { UsersSQL } from "@sql/users/UsersSQL.js";
import bcrypt from "bcryptjs";

export const UsersService = {
  search: async (dataItem: any) => {
    const sql = UsersSQL.search(dataItem);
    return await MySQLExecute.search(sql);
  },

  count: async (dataItem: any) => {
    const sql = UsersSQL.count(dataItem);
    const result = await MySQLExecute.searchOne<{ total: number }>(sql);
    return result?.total || 0;
  },

  findById: async (id: number) => {
    const sql = UsersSQL.findById(id);
    return await MySQLExecute.searchOne(sql);
  },

  create: async (dataItem: any) => {
    const passwordHash = await bcrypt.hash(
      dataItem.PASSWORD || "Temp@1234",
      12,
    );
    const sql = UsersSQL.create({ ...dataItem, PASSWORD_HASH: passwordHash });
    return await MySQLExecute.execute(sql);
  },

  update: async (dataItem: any) => {
    const sql = UsersSQL.update(dataItem);
    return await MySQLExecute.execute(sql);
  },

  delete: async (id: number, deleteBy: string) => {
    const sql = UsersSQL.delete(id, deleteBy);
    return await MySQLExecute.execute(sql);
  },

  getSubordinates: async (supervisorId: number) => {
    const sql = UsersSQL.getSubordinates(supervisorId);
    return await MySQLExecute.search(sql);
  },

  assignRole: async (userId: number, roleId: number, assignedBy: number) => {
    const sql = UsersSQL.assignRole(userId, roleId, assignedBy);
    return await MySQLExecute.execute(sql);
  },

  removeRole: async (userId: number, roleId: number) => {
    const sql = UsersSQL.removeRole(userId, roleId);
    return await MySQLExecute.execute(sql);
  },

  getUserRoles: async (userId: number) => {
    const sql = UsersSQL.getUserRoles(userId);
    return await MySQLExecute.search(sql);
  },
};
