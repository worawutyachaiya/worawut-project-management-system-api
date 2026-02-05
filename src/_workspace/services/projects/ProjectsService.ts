import { MySQLExecute } from "@businessData/dbExecute.js";
import { ProjectsSQL } from "@sql/projects/ProjectsSQL.js";

export const ProjectsService = {
  search: async (dataItem: any) => {
    const sql = ProjectsSQL.search(dataItem);
    return await MySQLExecute.search(sql);
  },

  count: async (dataItem: any) => {
    const sql = ProjectsSQL.count(dataItem);
    const result = await MySQLExecute.searchOne<{ total: number }>(sql);
    return result?.total || 0;
  },

  findById: async (id: number) => {
    const sql = ProjectsSQL.findById(id);
    return await MySQLExecute.searchOne(sql);
  },

  create: async (dataItem: any) => {
    const sql = ProjectsSQL.create(dataItem);
    return await MySQLExecute.execute(sql);
  },

  update: async (dataItem: any) => {
    const sql = ProjectsSQL.update(dataItem);
    return await MySQLExecute.execute(sql);
  },

  delete: async (id: number, deleteBy: string) => {
    const sql = ProjectsSQL.delete(id, deleteBy);
    return await MySQLExecute.execute(sql);
  },

  getMembers: async (projectId: number) => {
    const sql = ProjectsSQL.getMembers(projectId);
    return await MySQLExecute.search(sql);
  },

  addMember: async (
    projectId: number,
    userId: number,
    role: string = "MEMBER",
  ) => {
    const sql = ProjectsSQL.addMember(projectId, userId, role);
    return await MySQLExecute.execute(sql);
  },

  removeMember: async (projectId: number, userId: number) => {
    const sql = ProjectsSQL.removeMember(projectId, userId);
    return await MySQLExecute.execute(sql);
  },

  isMember: async (projectId: number, userId: number) => {
    const sql = ProjectsSQL.isMember(projectId, userId);
    const result = await MySQLExecute.searchOne(sql);
    return !!result;
  },

  finalize: async (projectId: number, updateBy: string) => {
    const sql = ProjectsSQL.finalize(projectId, updateBy);
    return await MySQLExecute.execute(sql);
  },

  getAnalytics: async (projectId: number) => {
    const sql = ProjectsSQL.getAnalytics(projectId);
    return await MySQLExecute.searchOne(sql);
  },
};
