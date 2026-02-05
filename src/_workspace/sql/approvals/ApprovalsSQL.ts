export const ApprovalsSQL = {
  getPending: (approverId: number) => {
    return `
      SELECT 
        ta.ID,
        ta.TASK_ID,
        ta.STATUS,
        ta.SEQUENCE_ORDER,
        ta.CREATE_DATE,
        t.CODE as TASK_CODE,
        t.TITLE as TASK_TITLE,
        t.PRIORITY as TASK_PRIORITY,
        t.DUE_DATE,
        p.NAME as PROJECT_NAME,
        CONCAT(c.FIRST_NAME, ' ', c.LAST_NAME) as CREATED_BY_NAME
      FROM TASK_APPROVALS ta
      JOIN TASKS t ON ta.TASK_ID = t.ID AND t.INUSE = 1
      LEFT JOIN PROJECTS p ON t.PROJECT_ID = p.ID AND p.INUSE = 1
      LEFT JOIN USERS c ON t.CREATED_BY_ID = c.ID AND c.INUSE = 1
      WHERE ta.APPROVER_ID = ${approverId}
        AND ta.STATUS = 'PENDING'
        AND ta.INUSE = 1
        AND t.STATUS = 'PENDING_REVIEW'
      ORDER BY ta.CREATE_DATE ASC
    `;
  },

  findByTaskAndApprover: (taskId: number, approverId: number) => {
    return `
      SELECT * FROM TASK_APPROVALS
      WHERE TASK_ID = ${taskId} AND APPROVER_ID = ${approverId} AND INUSE = 1
      ORDER BY SEQUENCE_ORDER ASC
      LIMIT 1
    `;
  },

  create: (
    taskId: number,
    approverId: number,
    sequenceOrder: number,
    createBy: string,
  ) => {
    return `
      INSERT INTO TASK_APPROVALS (TASK_ID, APPROVER_ID, STATUS, SEQUENCE_ORDER, CREATE_BY, CREATE_DATE)
      VALUES (${taskId}, ${approverId}, 'PENDING', ${sequenceOrder}, '${createBy}', NOW())
    `;
  },

  updateStatus: (
    approvalId: number,
    status: string,
    comments: string | null,
    updateBy: string,
  ) => {
    return `
      UPDATE TASK_APPROVALS
      SET STATUS = '${status}',
          DECISION_DATE = NOW(),
          COMMENTS = ${comments ? `'${comments.replace(/'/g, "''")}'` : "NULL"},
          UPDATE_BY = '${updateBy}',
          UPDATE_DATE = NOW()
      WHERE ID = ${approvalId}
    `;
  },

  getByTask: (taskId: number) => {
    return `
      SELECT 
        ta.*,
        CONCAT(u.FIRST_NAME, ' ', u.LAST_NAME) as APPROVER_NAME,
        u.EMAIL as APPROVER_EMAIL
      FROM TASK_APPROVALS ta
      JOIN USERS u ON ta.APPROVER_ID = u.ID AND u.INUSE = 1
      WHERE ta.TASK_ID = ${taskId} AND ta.INUSE = 1
      ORDER BY ta.SEQUENCE_ORDER ASC
    `;
  },

  resetForTask: (taskId: number) => {
    return `
      UPDATE TASK_APPROVALS
      SET STATUS = 'PENDING', DECISION_DATE = NULL, COMMENTS = NULL
      WHERE TASK_ID = ${taskId} AND INUSE = 1
    `;
  },
};
