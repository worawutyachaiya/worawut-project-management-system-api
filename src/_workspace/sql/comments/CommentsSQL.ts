export const CommentsSQL = {
  search: (taskId: number) => {
    return `
      SELECT 
        c.ID,
        c.UUID,
        c.TASK_ID,
        c.PARENT_ID,
        c.USER_ID,
        c.CONTENT,
        c.IS_SYSTEM,
        c.CREATE_DATE,
        c.UPDATE_DATE,
        CONCAT(u.FIRST_NAME, ' ', u.LAST_NAME) as USER_NAME,
        u.AVATAR_URL as USER_AVATAR
      FROM COMMENTS c
      JOIN USERS u ON c.USER_ID = u.ID AND u.INUSE = 1
      WHERE c.TASK_ID = ${taskId}
        AND c.INUSE = 1
      ORDER BY c.CREATE_DATE ASC
    `;
  },

  findById: (id: number) => {
    return `
      SELECT * FROM COMMENTS
      WHERE ID = ${id} AND INUSE = 1
    `;
  },

  create: (dataItem: any) => {
    return `
      INSERT INTO COMMENTS (UUID, TASK_ID, PARENT_ID, USER_ID, CONTENT, IS_SYSTEM, CREATE_BY, CREATE_DATE)
      VALUES (
        UUID(),
        ${dataItem.TASK_ID},
        ${dataItem.PARENT_ID || "NULL"},
        ${dataItem.USER_ID},
        '${dataItem.CONTENT.replace(/'/g, "''")}',
        ${dataItem.IS_SYSTEM ? 1 : 0},
        '${dataItem.CREATE_BY}',
        NOW()
      )
    `;
  },

  update: (id: number, content: string, updateBy: string) => {
    return `
      UPDATE COMMENTS
      SET CONTENT = '${content.replace(/'/g, "''")}',
          UPDATE_BY = '${updateBy}',
          UPDATE_DATE = NOW()
      WHERE ID = ${id}
    `;
  },

  delete: (id: number, deleteBy: string) => {
    return `UPDATE COMMENTS SET INUSE = 0, UPDATE_BY = '${deleteBy}', UPDATE_DATE = NOW() WHERE ID = ${id}`;
  },
};
