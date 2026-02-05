export const UsersSQL = {
  search: (dataItem: any) => {
    let sql = `
      SELECT 
        u.ID,
        u.UUID,
        u.EMPLOYEE_CODE,
        u.EMAIL,
        u.FIRST_NAME,
        u.LAST_NAME,
        u.PHONE,
        u.AVATAR_URL,
        u.DEPARTMENT_ID,
        u.SUPERVISOR_ID,
        u.STATUS,
        u.LAST_LOGIN_AT,
        u.CREATE_DATE,
        d.NAME as DEPARTMENT_NAME,
        CONCAT(s.FIRST_NAME, ' ', s.LAST_NAME) as SUPERVISOR_NAME,
        r.NAME as ROLE_NAME
      FROM USERS u
      LEFT JOIN DEPARTMENTS d ON u.DEPARTMENT_ID = d.ID AND d.INUSE = 1
      LEFT JOIN USERS s ON u.SUPERVISOR_ID = s.ID AND s.INUSE = 1
      LEFT JOIN USER_ROLES ur ON u.ID = ur.USER_ID AND ur.INUSE = 1
      LEFT JOIN ROLES r ON ur.ROLE_ID = r.ID AND r.INUSE = 1
      WHERE u.INUSE = 1
    `;

    if (dataItem?.ID) {
      sql += ` AND u.ID = ${dataItem.ID} `;
    }

    if (dataItem?.EMAIL) {
      sql += ` AND u.EMAIL LIKE '%${dataItem.EMAIL}%' `;
    }

    if (dataItem?.EMPLOYEE_CODE) {
      sql += ` AND u.EMPLOYEE_CODE LIKE '%${dataItem.EMPLOYEE_CODE}%' `;
    }

    if (dataItem?.NAME) {
      sql += ` AND (u.FIRST_NAME LIKE '%${dataItem.NAME}%' OR u.LAST_NAME LIKE '%${dataItem.NAME}%') `;
    }

    if (dataItem?.DEPARTMENT_ID) {
      sql += ` AND u.DEPARTMENT_ID = ${dataItem.DEPARTMENT_ID} `;
    }

    if (dataItem?.STATUS) {
      sql += ` AND u.STATUS = '${dataItem.STATUS}' `;
    }

    if (dataItem?.SUPERVISOR_ID) {
      sql += ` AND u.SUPERVISOR_ID = ${dataItem.SUPERVISOR_ID} `;
    }

    sql += ` ORDER BY u.ID DESC `;

    if (dataItem?.limit) {
      const offset = dataItem?.offset || 0;
      sql += ` LIMIT ${dataItem.limit} OFFSET ${offset} `;
    }

    return sql;
  },

  count: (dataItem: any) => {
    let sql = `
      SELECT COUNT(*) as total
      FROM USERS u
      WHERE u.INUSE = 1
    `;

    if (dataItem?.EMAIL) {
      sql += ` AND u.EMAIL LIKE '%${dataItem.EMAIL}%' `;
    }

    if (dataItem?.DEPARTMENT_ID) {
      sql += ` AND u.DEPARTMENT_ID = ${dataItem.DEPARTMENT_ID} `;
    }

    if (dataItem?.STATUS) {
      sql += ` AND u.STATUS = '${dataItem.STATUS}' `;
    }

    return sql;
  },

  findById: (id: number) => {
    return `
      SELECT 
        u.ID,
        u.UUID,
        u.EMPLOYEE_CODE,
        u.EMAIL,
        u.FIRST_NAME,
        u.LAST_NAME,
        u.PHONE,
        u.AVATAR_URL,
        u.DEPARTMENT_ID,
        u.SUPERVISOR_ID,
        u.STATUS,
        u.LAST_LOGIN_AT,
        u.CREATE_DATE,
        d.NAME as DEPARTMENT_NAME
      FROM USERS u
      LEFT JOIN DEPARTMENTS d ON u.DEPARTMENT_ID = d.ID AND d.INUSE = 1
      WHERE u.ID = ${id}
        AND u.INUSE = 1
    `;
  },

  create: (dataItem: any) => {
    return `
      INSERT INTO USERS (
        UUID, EMPLOYEE_CODE, EMAIL, PASSWORD_HASH, 
        FIRST_NAME, LAST_NAME, PHONE, AVATAR_URL,
        DEPARTMENT_ID, SUPERVISOR_ID, STATUS,
        CREATE_BY, CREATE_DATE
      ) VALUES (
        UUID(),
        '${dataItem.EMPLOYEE_CODE}',
        '${dataItem.EMAIL}',
        '${dataItem.PASSWORD_HASH}',
        '${dataItem.FIRST_NAME}',
        '${dataItem.LAST_NAME}',
        ${dataItem.PHONE ? `'${dataItem.PHONE}'` : "NULL"},
        ${dataItem.AVATAR_URL ? `'${dataItem.AVATAR_URL}'` : "NULL"},
        ${dataItem.DEPARTMENT_ID || "NULL"},
        ${dataItem.SUPERVISOR_ID || "NULL"},
        '${dataItem.STATUS || "ACTIVE"}',
        '${dataItem.CREATE_BY}',
        NOW()
      )
    `;
  },

  update: (dataItem: any) => {
    let sql = `UPDATE USERS SET UPDATE_DATE = NOW(), UPDATE_BY = '${dataItem.UPDATE_BY}'`;

    if (dataItem.FIRST_NAME) sql += `, FIRST_NAME = '${dataItem.FIRST_NAME}'`;
    if (dataItem.LAST_NAME) sql += `, LAST_NAME = '${dataItem.LAST_NAME}'`;
    if (dataItem.PHONE !== undefined)
      sql += `, PHONE = ${dataItem.PHONE ? `'${dataItem.PHONE}'` : "NULL"}`;
    if (dataItem.AVATAR_URL !== undefined)
      sql += `, AVATAR_URL = ${dataItem.AVATAR_URL ? `'${dataItem.AVATAR_URL}'` : "NULL"}`;
    if (dataItem.DEPARTMENT_ID !== undefined)
      sql += `, DEPARTMENT_ID = ${dataItem.DEPARTMENT_ID || "NULL"}`;
    if (dataItem.SUPERVISOR_ID !== undefined)
      sql += `, SUPERVISOR_ID = ${dataItem.SUPERVISOR_ID || "NULL"}`;
    if (dataItem.STATUS) sql += `, STATUS = '${dataItem.STATUS}'`;

    sql += ` WHERE ID = ${dataItem.ID}`;

    return sql;
  },

  delete: (id: number, deleteBy: string) => {
    return `
      UPDATE USERS 
      SET INUSE = 0, UPDATE_BY = '${deleteBy}', UPDATE_DATE = NOW()
      WHERE ID = ${id}
    `;
  },

  getSubordinates: (supervisorId: number) => {
    return `
      SELECT 
        u.ID,
        u.UUID,
        u.EMPLOYEE_CODE,
        u.EMAIL,
        u.FIRST_NAME,
        u.LAST_NAME,
        u.DEPARTMENT_ID,
        u.STATUS
      FROM USERS u
      WHERE u.SUPERVISOR_ID = ${supervisorId}
        AND u.INUSE = 1
        AND u.STATUS = 'ACTIVE'
      ORDER BY u.FIRST_NAME ASC
    `;
  },

  assignRole: (userId: number, roleId: number, assignedBy: number) => {
    return `
      INSERT INTO USER_ROLES (USER_ID, ROLE_ID, ASSIGNED_BY, ASSIGNED_DATE)
      VALUES (${userId}, ${roleId}, ${assignedBy}, NOW())
      ON DUPLICATE KEY UPDATE INUSE = 1, ASSIGNED_BY = ${assignedBy}, ASSIGNED_DATE = NOW()
    `;
  },

  removeRole: (userId: number, roleId: number) => {
    return `
      UPDATE USER_ROLES
      SET INUSE = 0
      WHERE USER_ID = ${userId} AND ROLE_ID = ${roleId}
    `;
  },

  getUserRoles: (userId: number) => {
    return `
      SELECT r.ID, r.CODE, r.NAME, r.LEVEL
      FROM USER_ROLES ur
      JOIN ROLES r ON ur.ROLE_ID = r.ID AND r.INUSE = 1
      WHERE ur.USER_ID = ${userId} AND ur.INUSE = 1
    `;
  },
};
