export const ProjectsSQL = {
  search: (dataItem: any) => {
    let sql = `
      SELECT 
        p.ID,
        p.UUID,
        p.CODE,
        p.NAME,
        p.DESCRIPTION,
        p.DEPARTMENT_ID,
        p.OWNER_ID,
        p.STATUS,
        p.PRIORITY,
        p.START_DATE,
        p.END_DATE,
        p.ACTUAL_END_DATE,
        p.PROGRESS,
        p.CREATE_DATE,
        d.NAME as DEPARTMENT_NAME,
        CONCAT(o.FIRST_NAME, ' ', o.LAST_NAME) as OWNER_NAME,
        (SELECT COUNT(*) FROM TASKS t WHERE t.PROJECT_ID = p.ID AND t.INUSE = 1) as TASK_COUNT,
        (SELECT COUNT(*) FROM TASKS t WHERE t.PROJECT_ID = p.ID AND t.STATUS = 'COMPLETED' AND t.INUSE = 1) as COMPLETED_TASK_COUNT,
        ROUND(
          CASE 
            WHEN (SELECT COUNT(*) FROM TASKS t WHERE t.PROJECT_ID = p.ID AND t.INUSE = 1) > 0 
            THEN (SELECT COUNT(*) FROM TASKS t WHERE t.PROJECT_ID = p.ID AND t.STATUS = 'COMPLETED' AND t.INUSE = 1) * 100.0 / 
                 (SELECT COUNT(*) FROM TASKS t WHERE t.PROJECT_ID = p.ID AND t.INUSE = 1)
            ELSE 0 
          END
        ) as CALCULATED_PROGRESS
      FROM PROJECTS p
      LEFT JOIN DEPARTMENTS d ON p.DEPARTMENT_ID = d.ID AND d.INUSE = 1
      LEFT JOIN USERS o ON p.OWNER_ID = o.ID AND o.INUSE = 1
      WHERE p.INUSE = 1
    `;

    if (dataItem?.ID) {
      sql += ` AND p.ID = ${dataItem.ID} `;
    }

    if (dataItem?.CODE) {
      sql += ` AND p.CODE LIKE '%${dataItem.CODE}%' `;
    }

    if (dataItem?.NAME) {
      sql += ` AND p.NAME LIKE '%${dataItem.NAME}%' `;
    }

    if (dataItem?.DEPARTMENT_ID) {
      sql += ` AND p.DEPARTMENT_ID = ${dataItem.DEPARTMENT_ID} `;
    }

    if (dataItem?.OWNER_ID) {
      sql += ` AND p.OWNER_ID = ${dataItem.OWNER_ID} `;
    }

    if (dataItem?.STATUS) {
      sql += ` AND p.STATUS = '${dataItem.STATUS}' `;
    }

    if (dataItem?.PRIORITY) {
      sql += ` AND p.PRIORITY = '${dataItem.PRIORITY}' `;
    }

    // Filter by member
    if (dataItem?.MEMBER_ID) {
      sql += ` AND (p.OWNER_ID = ${dataItem.MEMBER_ID} OR EXISTS (
        SELECT 1 FROM PROJECT_MEMBERS pm WHERE pm.PROJECT_ID = p.ID AND pm.USER_ID = ${dataItem.MEMBER_ID} AND pm.INUSE = 1
      )) `;
    }

    sql += ` ORDER BY p.ID DESC `;

    if (dataItem?.limit) {
      const offset = dataItem?.offset || 0;
      sql += ` LIMIT ${dataItem.limit} OFFSET ${offset} `;
    }

    return sql;
  },

  count: (dataItem: any) => {
    let sql = `SELECT COUNT(*) as total FROM PROJECTS p WHERE p.INUSE = 1`;

    if (dataItem?.DEPARTMENT_ID) {
      sql += ` AND p.DEPARTMENT_ID = ${dataItem.DEPARTMENT_ID} `;
    }

    if (dataItem?.STATUS) {
      sql += ` AND p.STATUS = '${dataItem.STATUS}' `;
    }

    if (dataItem?.MEMBER_ID) {
      sql += ` AND (p.OWNER_ID = ${dataItem.MEMBER_ID} OR EXISTS (
        SELECT 1 FROM PROJECT_MEMBERS pm WHERE pm.PROJECT_ID = p.ID AND pm.USER_ID = ${dataItem.MEMBER_ID} AND pm.INUSE = 1
      )) `;
    }

    return sql;
  },

  findById: (id: number) => {
    return `
      SELECT 
        p.ID,
        p.UUID,
        p.CODE,
        p.NAME,
        p.DESCRIPTION,
        p.DEPARTMENT_ID,
        p.OWNER_ID,
        p.STATUS,
        p.PRIORITY,
        p.START_DATE,
        p.END_DATE,
        p.ACTUAL_END_DATE,
        p.PROGRESS,
        p.CREATE_BY,
        p.CREATE_DATE,
        p.UPDATE_BY,
        p.UPDATE_DATE,
        d.NAME as DEPARTMENT_NAME,
        CONCAT(o.FIRST_NAME, ' ', o.LAST_NAME) as OWNER_NAME
      FROM PROJECTS p
      LEFT JOIN DEPARTMENTS d ON p.DEPARTMENT_ID = d.ID AND d.INUSE = 1
      LEFT JOIN USERS o ON p.OWNER_ID = o.ID AND o.INUSE = 1
      WHERE p.ID = ${id}
        AND p.INUSE = 1
    `;
  },

  create: (dataItem: any) => {
    return `
      INSERT INTO PROJECTS (
        UUID, CODE, NAME, DESCRIPTION, DEPARTMENT_ID, OWNER_ID,
        STATUS, PRIORITY, START_DATE, END_DATE,
        CREATE_BY, CREATE_DATE
      ) VALUES (
        UUID(),
        '${dataItem.CODE}',
        '${dataItem.NAME}',
        ${dataItem.DESCRIPTION ? `'${dataItem.DESCRIPTION}'` : "NULL"},
        ${dataItem.DEPARTMENT_ID},
        ${dataItem.OWNER_ID},
        '${dataItem.STATUS || "DRAFT"}',
        '${dataItem.PRIORITY || "MEDIUM"}',
        ${dataItem.START_DATE ? `'${dataItem.START_DATE}'` : "NULL"},
        ${dataItem.END_DATE ? `'${dataItem.END_DATE}'` : "NULL"},
        '${dataItem.CREATE_BY}',
        NOW()
      )
    `;
  },

  update: (dataItem: any) => {
    let sql = `UPDATE PROJECTS SET UPDATE_DATE = NOW(), UPDATE_BY = '${dataItem.UPDATE_BY}'`;

    if (dataItem.NAME) sql += `, NAME = '${dataItem.NAME}'`;
    if (dataItem.DESCRIPTION !== undefined)
      sql += `, DESCRIPTION = ${dataItem.DESCRIPTION ? `'${dataItem.DESCRIPTION}'` : "NULL"}`;
    if (dataItem.STATUS) sql += `, STATUS = '${dataItem.STATUS}'`;
    if (dataItem.PRIORITY) sql += `, PRIORITY = '${dataItem.PRIORITY}'`;
    if (dataItem.START_DATE !== undefined)
      sql += `, START_DATE = ${dataItem.START_DATE ? `'${dataItem.START_DATE}'` : "NULL"}`;
    if (dataItem.END_DATE !== undefined)
      sql += `, END_DATE = ${dataItem.END_DATE ? `'${dataItem.END_DATE}'` : "NULL"}`;
    if (dataItem.ACTUAL_END_DATE !== undefined)
      sql += `, ACTUAL_END_DATE = ${dataItem.ACTUAL_END_DATE ? `'${dataItem.ACTUAL_END_DATE}'` : "NULL"}`;
    if (dataItem.PROGRESS !== undefined)
      sql += `, PROGRESS = ${dataItem.PROGRESS}`;

    sql += ` WHERE ID = ${dataItem.ID}`;

    return sql;
  },

  delete: (id: number, deleteBy: string) => {
    return `
      UPDATE PROJECTS 
      SET INUSE = 0, UPDATE_BY = '${deleteBy}', UPDATE_DATE = NOW()
      WHERE ID = ${id}
    `;
  },

  // Project Members
  getMembers: (projectId: number) => {
    return `
      SELECT 
        pm.ID,
        pm.USER_ID,
        pm.ROLE,
        pm.JOINED_DATE,
        u.EMPLOYEE_CODE,
        u.EMAIL,
        u.FIRST_NAME,
        u.LAST_NAME,
        u.AVATAR_URL
      FROM PROJECT_MEMBERS pm
      JOIN USERS u ON pm.USER_ID = u.ID AND u.INUSE = 1
      WHERE pm.PROJECT_ID = ${projectId}
        AND pm.INUSE = 1
      ORDER BY pm.ROLE, u.FIRST_NAME
    `;
  },

  addMember: (projectId: number, userId: number, role: string = "MEMBER") => {
    return `
      INSERT INTO PROJECT_MEMBERS (PROJECT_ID, USER_ID, ROLE, JOINED_DATE)
      VALUES (${projectId}, ${userId}, '${role}', NOW())
      ON DUPLICATE KEY UPDATE INUSE = 1, ROLE = '${role}'
    `;
  },

  removeMember: (projectId: number, userId: number) => {
    return `
      UPDATE PROJECT_MEMBERS
      SET INUSE = 0
      WHERE PROJECT_ID = ${projectId} AND USER_ID = ${userId}
    `;
  },

  isMember: (projectId: number, userId: number) => {
    return `
      SELECT 1 as is_member FROM PROJECT_MEMBERS
      WHERE PROJECT_ID = ${projectId} AND USER_ID = ${userId} AND INUSE = 1
      UNION
      SELECT 1 FROM PROJECTS WHERE ID = ${projectId} AND OWNER_ID = ${userId} AND INUSE = 1
      LIMIT 1
    `;
  },

  finalize: (projectId: number, updateBy: string) => {
    return `
      UPDATE PROJECTS
      SET STATUS = 'COMPLETED', ACTUAL_END_DATE = CURDATE(), PROGRESS = 100.00,
          UPDATE_BY = '${updateBy}', UPDATE_DATE = NOW()
      WHERE ID = ${projectId}
    `;
  },

  getAnalytics: (projectId: number) => {
    return `
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN STATUS = 'COMPLETED' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN STATUS = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN STATUS = 'PENDING_REVIEW' THEN 1 ELSE 0 END) as pending_review_tasks,
        SUM(CASE WHEN STATUS = 'DRAFT' THEN 1 ELSE 0 END) as draft_tasks,
        SUM(CASE WHEN DUE_DATE < CURDATE() AND STATUS NOT IN ('COMPLETED', 'REJECTED') THEN 1 ELSE 0 END) as overdue_tasks,
        SUM(COALESCE(ESTIMATED_HOURS, 0)) as total_estimated_hours,
        SUM(COALESCE(ACTUAL_HOURS, 0)) as total_actual_hours
      FROM TASKS
      WHERE PROJECT_ID = ${projectId} AND INUSE = 1
    `;
  },
};
