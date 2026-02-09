export const TasksSQL = {
  search: (dataItem: any) => {
    let sql = `
      SELECT 
        t.ID,
        t.UUID,
        t.CODE,
        t.PROJECT_ID,
        t.PARENT_TASK_ID,
        t.TITLE,
        t.DESCRIPTION,
        t.STATUS,
        t.PRIORITY,
        t.TASK_TYPE,
        t.ESTIMATED_HOURS,
        t.ACTUAL_HOURS,
        t.DUE_DATE,
        t.COMPLETED_DATE,
        t.CREATED_BY_ID,
        t.CREATE_DATE,
        p.NAME as PROJECT_NAME,
        p.CODE as PROJECT_CODE,
        CONCAT(c.FIRST_NAME, ' ', c.LAST_NAME) as CREATED_BY_NAME
      FROM TASKS t
      LEFT JOIN PROJECTS p ON t.PROJECT_ID = p.ID AND p.INUSE = 1
      LEFT JOIN USERS c ON t.CREATED_BY_ID = c.ID AND c.INUSE = 1
      WHERE t.INUSE = 1
    `;

    if (dataItem?.ID) sql += ` AND t.ID = ${dataItem.ID} `;
    if (dataItem?.CODE) sql += ` AND t.CODE LIKE '%${dataItem.CODE}%' `;
    if (dataItem?.TITLE) sql += ` AND t.TITLE LIKE '%${dataItem.TITLE}%' `;
    if (dataItem?.PROJECT_ID)
      sql += ` AND t.PROJECT_ID = ${dataItem.PROJECT_ID} `;
    if (dataItem?.PARENT_TASK_ID)
      sql += ` AND t.PARENT_TASK_ID = ${dataItem.PARENT_TASK_ID} `;
    if (dataItem?.STATUS) sql += ` AND t.STATUS = '${dataItem.STATUS}' `;
    if (dataItem?.PRIORITY) sql += ` AND t.PRIORITY = '${dataItem.PRIORITY}' `;
    if (dataItem?.TASK_TYPE)
      sql += ` AND t.TASK_TYPE = '${dataItem.TASK_TYPE}' `;
    if (dataItem?.CREATED_BY_ID)
      sql += ` AND t.CREATED_BY_ID = ${dataItem.CREATED_BY_ID} `;

    // Filter by assignee
    if (dataItem?.ASSIGNEE_ID) {
      sql += ` AND EXISTS (SELECT 1 FROM TASK_ASSIGNEES ta WHERE ta.TASK_ID = t.ID AND ta.USER_ID = ${dataItem.ASSIGNEE_ID} AND ta.INUSE = 1) `;
    }

    // Filter overdue
    if (dataItem?.OVERDUE) {
      sql += ` AND t.DUE_DATE < CURDATE() AND t.STATUS NOT IN ('COMPLETED', 'REJECTED') `;
    }

    sql += ` ORDER BY t.ID DESC `;

    if (dataItem?.limit) {
      const offset = dataItem?.offset || 0;
      sql += ` LIMIT ${dataItem.limit} OFFSET ${offset} `;
    }

    return sql;
  },

  findById: (id: number) => {
    return `
      SELECT 
        t.*,
        p.NAME as PROJECT_NAME,
        p.CODE as PROJECT_CODE,
        CONCAT(c.FIRST_NAME, ' ', c.LAST_NAME) as CREATED_BY_NAME
      FROM TASKS t
      LEFT JOIN PROJECTS p ON t.PROJECT_ID = p.ID AND p.INUSE = 1
      LEFT JOIN USERS c ON t.CREATED_BY_ID = c.ID AND c.INUSE = 1
      WHERE t.ID = ${id} AND t.INUSE = 1
    `;
  },

  create: (dataItem: any) => {
    return `
      INSERT INTO TASKS (
        UUID, CODE, PROJECT_ID, PARENT_TASK_ID, TITLE, DESCRIPTION,
        STATUS, PRIORITY, TASK_TYPE, ESTIMATED_HOURS, DUE_DATE,
        CREATED_BY_ID, CREATE_BY, CREATE_DATE
      ) VALUES (
        UUID(),
        '${dataItem.CODE}',
        ${dataItem.PROJECT_ID},
        ${dataItem.PARENT_TASK_ID || "NULL"},
        '${dataItem.TITLE}',
        ${dataItem.DESCRIPTION ? `'${dataItem.DESCRIPTION.replace(/'/g, "''")}'` : "NULL"},
        '${dataItem.STATUS || "DRAFT"}',
        '${dataItem.PRIORITY || "MEDIUM"}',
        '${dataItem.TASK_TYPE || "TASK"}',
        ${dataItem.ESTIMATED_HOURS || "NULL"},
        ${dataItem.DUE_DATE ? `'${dataItem.DUE_DATE}'` : "NULL"},
        ${dataItem.CREATED_BY_ID},
        '${dataItem.CREATE_BY}',
        NOW()
      )
    `;
  },

  update: (dataItem: any) => {
    let sql = `UPDATE TASKS SET UPDATE_DATE = NOW(), UPDATE_BY = '${dataItem.UPDATE_BY}'`;

    if (dataItem.TITLE) sql += `, TITLE = '${dataItem.TITLE}'`;
    if (dataItem.PROJECT_ID) sql += `, PROJECT_ID = ${dataItem.PROJECT_ID}`;
    if (dataItem.DESCRIPTION !== undefined)
      sql += `, DESCRIPTION = ${dataItem.DESCRIPTION ? `'${dataItem.DESCRIPTION.replace(/'/g, "''")}'` : "NULL"}`;
    if (dataItem.STATUS) sql += `, STATUS = '${dataItem.STATUS}'`;
    if (dataItem.PRIORITY) sql += `, PRIORITY = '${dataItem.PRIORITY}'`;
    if (dataItem.TASK_TYPE) sql += `, TASK_TYPE = '${dataItem.TASK_TYPE}'`;
    if (dataItem.ESTIMATED_HOURS !== undefined)
      sql += `, ESTIMATED_HOURS = ${dataItem.ESTIMATED_HOURS || "NULL"}`;
    if (dataItem.ACTUAL_HOURS !== undefined)
      sql += `, ACTUAL_HOURS = ${dataItem.ACTUAL_HOURS || "NULL"}`;
    if (dataItem.DUE_DATE !== undefined)
      sql += `, DUE_DATE = ${dataItem.DUE_DATE ? `'${dataItem.DUE_DATE}'` : "NULL"}`;
    if (dataItem.COMPLETED_DATE !== undefined)
      sql += `, COMPLETED_DATE = ${dataItem.COMPLETED_DATE ? `'${dataItem.COMPLETED_DATE}'` : "NULL"}`;
    if (dataItem.TASK_URL !== undefined)
      sql += `, TASK_URL = ${dataItem.TASK_URL ? `'${dataItem.TASK_URL.replace(/'/g, "''")}'` : "NULL"}`;

    sql += ` WHERE ID = ${dataItem.ID}`;

    return sql;
  },

  updateStatus: (taskId: number, status: string, updateBy: string) => {
    let sql = `UPDATE TASKS SET STATUS = '${status}', UPDATE_BY = '${updateBy}', UPDATE_DATE = NOW()`;
    if (status === "COMPLETED") {
      sql += `, COMPLETED_DATE = NOW()`;
    }
    sql += ` WHERE ID = ${taskId}`;
    return sql;
  },

  delete: (id: number, deleteBy: string) => {
    return `UPDATE TASKS SET INUSE = 0, UPDATE_BY = '${deleteBy}', UPDATE_DATE = NOW() WHERE ID = ${id}`;
  },

  // Assignees
  getAssignees: (taskId: number) => {
    return `
      SELECT 
        ta.ID,
        ta.USER_ID,
        ta.IS_PRIMARY,
        ta.ASSIGNED_DATE,
        u.EMPLOYEE_CODE,
        u.EMAIL,
        u.FIRST_NAME,
        u.LAST_NAME,
        u.AVATAR_URL
      FROM TASK_ASSIGNEES ta
      JOIN USERS u ON ta.USER_ID = u.ID AND u.INUSE = 1
      WHERE ta.TASK_ID = ${taskId} AND ta.INUSE = 1
    `;
  },

  addAssignee: (
    taskId: number,
    userId: number,
    assignedBy: number,
    isPrimary: boolean = false,
  ) => {
    return `
      INSERT INTO TASK_ASSIGNEES (TASK_ID, USER_ID, ASSIGNED_BY, IS_PRIMARY, ASSIGNED_DATE)
      VALUES (${taskId}, ${userId}, ${assignedBy}, ${isPrimary ? 1 : 0}, NOW())
      ON DUPLICATE KEY UPDATE INUSE = 1, IS_PRIMARY = ${isPrimary ? 1 : 0}
    `;
  },

  removeAssignee: (taskId: number, userId: number) => {
    return `UPDATE TASK_ASSIGNEES SET INUSE = 0 WHERE TASK_ID = ${taskId} AND USER_ID = ${userId}`;
  },

  // History
  addHistory: (
    taskId: number,
    userId: number,
    action: string,
    fieldName: string | null,
    oldValue: string | null,
    newValue: string | null,
    ipAddress: string,
  ) => {
    return `
      INSERT INTO TASK_HISTORY (TASK_ID, USER_ID, ACTION, FIELD_NAME, OLD_VALUE, NEW_VALUE, IP_ADDRESS, CREATE_DATE)
      VALUES (${taskId}, ${userId}, '${action}', ${fieldName ? `'${fieldName}'` : "NULL"}, ${oldValue ? `'${oldValue}'` : "NULL"}, ${newValue ? `'${newValue}'` : "NULL"}, '${ipAddress}', NOW())
    `;
  },

  getHistory: (taskId: number) => {
    return `
      SELECT 
        th.*,
        CONCAT(u.FIRST_NAME, ' ', u.LAST_NAME) as USER_NAME
      FROM TASK_HISTORY th
      JOIN USERS u ON th.USER_ID = u.ID
      WHERE th.TASK_ID = ${taskId}
      ORDER BY th.CREATE_DATE DESC
    `;
  },

  generateCode: (projectCode: string) => {
    return `
      SELECT CONCAT('${projectCode}', '-', LPAD(COALESCE(MAX(CAST(SUBSTRING(CODE, LENGTH('${projectCode}') + 2) AS UNSIGNED)), 0) + 1, 4, '0')) as new_code
      FROM TASKS
      WHERE CODE LIKE '${projectCode}-%'
    `;
  },

  createCompletionLog: (
    taskId: number,
    completedDate: string,
    completedById: number,
    durationHours: number,
    snapshotData: string,
  ) => {
    return `
      INSERT INTO TASK_COMPLETION_LOGS (TASK_ID, COMPLETED_DATE, COMPLETED_BY_ID, DURATION_HOURS, SNAPSHOT_DATA, CREATE_DATE)
      VALUES (
        ${taskId},
        '${completedDate}',
        ${completedById},
        ${durationHours || 0},
        '${snapshotData.replace(/'/g, "''")}',
        NOW()
      )
    `;
  },

  getCompletionLogs: (taskId: number) => {
    return `
      SELECT 
        l.*,
        CONCAT(u.FIRST_NAME, ' ', u.LAST_NAME) as COMPLETED_BY_NAME,
        u.AVATAR_URL as COMPLETED_BY_AVATAR
      FROM TASK_COMPLETION_LOGS l
      JOIN USERS u ON l.COMPLETED_BY_ID = u.ID
      WHERE l.TASK_ID = ${taskId} AND l.INUSE = 1
      ORDER BY l.COMPLETED_DATE DESC
    `;
  },
};
