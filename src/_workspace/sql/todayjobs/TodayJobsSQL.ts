export const TodayJobsSQL = {
  getSubordinateTasks: (
    userId: number,
    roles: string[],
    departmentId?: number,
    dateFilter?: string,
  ) => {
    const isAdmin = roles.some((r) => r.toUpperCase() === "ADMIN");
    const isManager = roles.some((r) => r.toUpperCase() === "MANAGER");
    const isSupervisor = roles.some((r) => r.toUpperCase() === "SUPERVISOR");

    let sql = `
      SELECT 
        t.ID,
        t.UUID,
        t.CODE,
        t.TITLE,
        t.DESCRIPTION,
        t.STATUS,
        t.PRIORITY,
        t.TASK_TYPE,
        t.DUE_DATE,
        t.PROJECT_ID,
        p.NAME as PROJECT_NAME,
        CONCAT(c.FIRST_NAME, ' ', c.LAST_NAME) as CREATED_BY_NAME,
        GROUP_CONCAT(
          DISTINCT CONCAT(au.FIRST_NAME, ' ', au.LAST_NAME)
          SEPARATOR ', '
        ) as ASSIGNEE_NAMES,
        GROUP_CONCAT(DISTINCT au.ID) as ASSIGNEE_IDS
      FROM TASKS t
      JOIN PROJECTS p ON t.PROJECT_ID = p.ID AND p.INUSE = 1
      LEFT JOIN USERS c ON t.CREATED_BY_ID = c.ID AND c.INUSE = 1
      LEFT JOIN TASK_ASSIGNEES ta ON t.ID = ta.TASK_ID AND ta.INUSE = 1
      LEFT JOIN USERS au ON ta.USER_ID = au.ID AND au.INUSE = 1
      WHERE t.INUSE = 1
        AND t.STATUS NOT IN ('COMPLETED', 'APPROVED', 'REJECTED')
    `;

    if (dateFilter) {
      sql += ` AND t.DUE_DATE = '${dateFilter}' `;
    }

    if (isAdmin) {
    } else if (isManager) {
      sql += ` AND (
        EXISTS (
          SELECT 1 FROM TASK_ASSIGNEES ta2
          JOIN USERS u2 ON ta2.USER_ID = u2.ID
          WHERE ta2.TASK_ID = t.ID 
            AND ta2.INUSE = 1
            AND u2.INUSE = 1
            AND (
              u2.DEPARTMENT_ID = ${departmentId || 0}
              OR u2.SUPERVISOR_ID = ${userId}
              OR EXISTS (
                SELECT 1 FROM USERS sub 
                WHERE sub.SUPERVISOR_ID = ${userId} 
                  AND sub.ID = u2.SUPERVISOR_ID
                  AND sub.INUSE = 1
              )
            )
        )
      ) `;
    } else if (isSupervisor) {
      sql += ` AND EXISTS (
        SELECT 1 FROM TASK_ASSIGNEES ta2
        JOIN USERS u2 ON ta2.USER_ID = u2.ID
        WHERE ta2.TASK_ID = t.ID 
          AND ta2.INUSE = 1
          AND u2.SUPERVISOR_ID = ${userId}
          AND u2.INUSE = 1
      ) `;
    } else {
      sql += ` AND 1 = 0 `;
    }

    sql += `
      GROUP BY t.ID
      ORDER BY 
        t.DUE_DATE ASC,
        CASE t.PRIORITY 
          WHEN 'CRITICAL' THEN 1 
          WHEN 'HIGH' THEN 2 
          WHEN 'MEDIUM' THEN 3 
          WHEN 'LOW' THEN 4 
        END,
        t.CREATE_DATE DESC
    `;

    return sql;
  },

  countSubordinateTasks: (
    userId: number,
    roles: string[],
    departmentId?: number,
    dateFilter?: string,
  ) => {
    const isAdmin = roles.some((r) => r.toUpperCase() === "ADMIN");
    const isManager = roles.some((r) => r.toUpperCase() === "MANAGER");
    const isSupervisor = roles.some((r) => r.toUpperCase() === "SUPERVISOR");

    let sql = `
      SELECT COUNT(DISTINCT t.ID) as total
      FROM TASKS t
      WHERE t.INUSE = 1
        AND t.STATUS NOT IN ('COMPLETED', 'APPROVED', 'REJECTED')
    `;

    if (dateFilter) {
      sql += ` AND t.DUE_DATE = '${dateFilter}' `;
    }

    if (isAdmin) {
      // No filter
    } else if (isManager) {
      sql += ` AND (
        EXISTS (
          SELECT 1 FROM TASK_ASSIGNEES ta2
          JOIN USERS u2 ON ta2.USER_ID = u2.ID
          WHERE ta2.TASK_ID = t.ID 
            AND ta2.INUSE = 1
            AND u2.INUSE = 1
            AND (
              u2.DEPARTMENT_ID = ${departmentId || 0}
              OR u2.SUPERVISOR_ID = ${userId}
            )
        )
      ) `;
    } else if (isSupervisor) {
      sql += ` AND EXISTS (
        SELECT 1 FROM TASK_ASSIGNEES ta2
        JOIN USERS u2 ON ta2.USER_ID = u2.ID
        WHERE ta2.TASK_ID = t.ID 
          AND ta2.INUSE = 1
          AND u2.SUPERVISOR_ID = ${userId}
          AND u2.INUSE = 1
      ) `;
    } else {
      sql += ` AND 1 = 0 `;
    }

    return sql;
  },
};
