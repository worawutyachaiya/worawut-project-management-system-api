import { MySQLExecute } from "@businessData/dbExecute.js";
import { RolesSQL } from "@sql/roles/RolesSQL.js";

export const RolesService = {
  search: async (dataItem: any) => {
    const sql = RolesSQL.search(dataItem);
    return await MySQLExecute.search(sql);
  },

  findById: async (id: number) => {
    const sql = RolesSQL.findById(id);
    return await MySQLExecute.searchOne(sql);
  },

  create: async (dataItem: any) => {
    const sql = RolesSQL.create(dataItem);
    return await MySQLExecute.execute(sql);
  },

  update: async (dataItem: any) => {
    const sql = RolesSQL.update(dataItem);
    return await MySQLExecute.execute(sql);
  },

  delete: async (id: number, deleteBy: string) => {
    const sql = RolesSQL.delete(id, deleteBy);
    return await MySQLExecute.execute(sql);
  },

  getPermissions: async (roleId: number) => {
    const sql = RolesSQL.getPermissions(roleId);
    return await MySQLExecute.search(sql);
  },

  getAllPermissions: async () => {
    const sql = RolesSQL.getAllPermissions();
    return await MySQLExecute.search(sql);
  },

  assignPermission: async (roleId: number, permissionId: number) => {
    const sql = RolesSQL.assignPermission(roleId, permissionId);
    return await MySQLExecute.execute(sql);
  },

  removePermission: async (roleId: number, permissionId: number) => {
    const sql = RolesSQL.removePermission(roleId, permissionId);
    return await MySQLExecute.execute(sql);
  },
};
