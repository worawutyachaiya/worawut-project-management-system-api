export const FilesSQL = {
  search: (taskId: number) => {
    return `
      SELECT 
        f.ID,
        f.UUID,
        f.TASK_ID,
        f.FILE_NAME,
        f.ORIGINAL_NAME,
        f.FILE_TYPE,
        f.FILE_SIZE,
        f.MIME_TYPE,
        f.STORAGE_URL,
        f.THUMBNAIL_URL,
        f.CATEGORY,
        f.UPLOADED_BY_ID,
        f.CREATE_DATE,
        CONCAT(u.FIRST_NAME, ' ', u.LAST_NAME) as UPLOADED_BY_NAME
      FROM TASK_FILES f
      JOIN USERS u ON f.UPLOADED_BY_ID = u.ID AND u.INUSE = 1
      WHERE f.TASK_ID = ${taskId}
        AND f.INUSE = 1
      ORDER BY f.CREATE_DATE DESC
    `;
  },

  findById: (id: number) => {
    return `SELECT * FROM TASK_FILES WHERE ID = ${id} AND INUSE = 1`;
  },

  create: (dataItem: any) => {
    return `
      INSERT INTO TASK_FILES (
        UUID, TASK_ID, FILE_NAME, ORIGINAL_NAME, FILE_TYPE, FILE_SIZE,
        MIME_TYPE, STORAGE_URL, THUMBNAIL_URL, CATEGORY, UPLOADED_BY_ID, CREATE_BY, CREATE_DATE
      ) VALUES (
        UUID(),
        ${dataItem.TASK_ID},
        '${dataItem.FILE_NAME}',
        '${dataItem.ORIGINAL_NAME}',
        '${dataItem.FILE_TYPE}',
        ${dataItem.FILE_SIZE},
        '${dataItem.MIME_TYPE}',
        '${dataItem.STORAGE_URL}',
        ${dataItem.THUMBNAIL_URL ? `'${dataItem.THUMBNAIL_URL}'` : "NULL"},
        '${dataItem.CATEGORY || "ATTACHMENT"}',
        ${dataItem.UPLOADED_BY_ID},
        '${dataItem.CREATE_BY}',
        NOW()
      )
    `;
  },

  delete: (id: number, deleteBy: string) => {
    return `UPDATE TASK_FILES SET INUSE = 0, UPDATE_BY = '${deleteBy}', UPDATE_DATE = NOW() WHERE ID = ${id}`;
  },
};
