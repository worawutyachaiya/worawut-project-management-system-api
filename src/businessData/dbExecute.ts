import { connection } from "./db.js";

export const MySQLExecute = {
  // For SELECT queries
  search: async <T = any>(
    query: string,
    configDb: string = "",
  ): Promise<T[]> => {
    let conn = null;
    try {
      conn = await connection(configDb);
      const [rows] = await conn.query(query);
      return rows as T[];
    } catch (error: any) {
      console.error("MySQL Search Error:", error.message);
      throw error;
    } finally {
      if (conn) await conn.end();
    }
  },

  // For single row SELECT
  searchOne: async <T = any>(
    query: string,
    configDb: string = "",
  ): Promise<T | null> => {
    let conn = null;
    try {
      conn = await connection(configDb);
      const [rows] = await conn.query(query);
      const result = rows as T[];
      return result.length > 0 ? result[0] : null;
    } catch (error: any) {
      console.error("MySQL SearchOne Error:", error.message);
      throw error;
    } finally {
      if (conn) await conn.end();
    }
  },

  // For INSERT, UPDATE, DELETE
  execute: async (query: string, configDb: string = ""): Promise<any> => {
    let conn = null;
    try {
      conn = await connection(configDb);
      const [result] = await conn.query(query);
      return result;
    } catch (error: any) {
      console.error("MySQL Execute Error:", error.message);
      throw error;
    } finally {
      if (conn) await conn.end();
    }
  },

  // For multiple queries with transaction
  executeList: async (
    sqlList: string[],
    configDb: string = "",
  ): Promise<any[]> => {
    let conn = null;
    try {
      conn = await connection(configDb);
      await conn.beginTransaction();

      const results = [];
      for (const sql of sqlList) {
        const [result] = await conn.query(sql);
        results.push(result);
      }

      await conn.commit();
      return results;
    } catch (error: any) {
      if (conn) await conn.rollback();
      console.error("MySQL ExecuteList Error:", error.message);
      throw error;
    } finally {
      if (conn) await conn.end();
    }
  },

  // For parameterized queries (safer)
  searchParams: async <T = any>(
    query: string,
    params: any[],
    configDb: string = "",
  ): Promise<T[]> => {
    let conn = null;
    try {
      conn = await connection(configDb);
      const [rows] = await conn.execute(query, params);
      return rows as T[];
    } catch (error: any) {
      console.error("MySQL SearchParams Error:", error.message);
      throw error;
    } finally {
      if (conn) await conn.end();
    }
  },

  executeParams: async (
    query: string,
    params: any[],
    configDb: string = "",
  ): Promise<any> => {
    let conn = null;
    try {
      conn = await connection(configDb);
      const [result] = await conn.execute(query, params);
      return result;
    } catch (error: any) {
      console.error("MySQL ExecuteParams Error:", error.message);
      throw error;
    } finally {
      if (conn) await conn.end();
    }
  },
};
