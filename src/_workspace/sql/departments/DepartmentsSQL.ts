export const DepartmentsSQL = {
  search: (dataItem: any) => {
    let sql = `
      SELECT 
        d.ID,
        d.CODE,
        d.NAME,
        d.DESCRIPTION,
        d.PARENT_ID,
        d.MANAGER_ID,
        d.CREATE_DATE,
        p.NAME as PARENT_NAME,
        CONCAT(m.FIRST_NAME, ' ', m.LAST_NAME) as MANAGER_NAME,
        (SELECT COUNT(*) FROM USERS u WHERE u.DEPARTMENT_ID = d.ID AND u.INUSE = 1) as USER_COUNT
      FROM DEPARTMENTS d
      LEFT JOIN DEPARTMENTS p ON d.PARENT_ID = p.ID AND p.INUSE = 1
      LEFT JOIN USERS m ON d.MANAGER_ID = m.ID AND m.INUSE = 1
      WHERE d.INUSE = 1
    `;

    if (dataItem?.ID) {
      sql += ` AND d.ID = ${dataItem.ID} `;
    }

    if (dataItem?.CODE) {
      sql += ` AND d.CODE LIKE '%${dataItem.CODE}%' `;
    }

    if (dataItem?.NAME) {
      sql += ` AND d.NAME LIKE '%${dataItem.NAME}%' `;
    }

    if (dataItem?.PARENT_ID) {
      sql += ` AND d.PARENT_ID = ${dataItem.PARENT_ID} `;
    }

    sql += ` ORDER BY d.NAME ASC `;

    return sql;
  },

  findById: (id: number) => {
    return `
      SELECT 
        d.ID,
        d.CODE,
        d.NAME,
        d.DESCRIPTION,
        d.PARENT_ID,
        d.MANAGER_ID,
        d.CREATE_DATE,
        p.NAME as PARENT_NAME,
        CONCAT(m.FIRST_NAME, ' ', m.LAST_NAME) as MANAGER_NAME
      FROM DEPARTMENTS d
      LEFT JOIN DEPARTMENTS p ON d.PARENT_ID = p.ID AND p.INUSE = 1
      LEFT JOIN USERS m ON d.MANAGER_ID = m.ID AND m.INUSE = 1
      WHERE d.ID = ${id}
        AND d.INUSE = 1
    `;
  },

  create: (dataItem: any) => {
    return `
      INSERT INTO DEPARTMENTS (CODE, NAME, DESCRIPTION, PARENT_ID, MANAGER_ID, CREATE_BY, CREATE_DATE)
      VALUES (
        '${dataItem.CODE}',
        '${dataItem.NAME}',
        ${dataItem.DESCRIPTION ? `'${dataItem.DESCRIPTION}'` : "NULL"},
        ${dataItem.PARENT_ID || "NULL"},
        ${dataItem.MANAGER_ID || "NULL"},
        '${dataItem.CREATE_BY}',
        NOW()
      )
    `;
  },

  update: (dataItem: any) => {
    let sql = `UPDATE DEPARTMENTS SET UPDATE_DATE = NOW(), UPDATE_BY = '${dataItem.UPDATE_BY}'`;

    if (dataItem.CODE) sql += `, CODE = '${dataItem.CODE}'`;
    if (dataItem.NAME) sql += `, NAME = '${dataItem.NAME}'`;
    if (dataItem.DESCRIPTION !== undefined)
      sql += `, DESCRIPTION = ${dataItem.DESCRIPTION ? `'${dataItem.DESCRIPTION}'` : "NULL"}`;
    if (dataItem.PARENT_ID !== undefined)
      sql += `, PARENT_ID = ${dataItem.PARENT_ID || "NULL"}`;
    if (dataItem.MANAGER_ID !== undefined)
      sql += `, MANAGER_ID = ${dataItem.MANAGER_ID || "NULL"}`;

    sql += ` WHERE ID = ${dataItem.ID}`;

    return sql;
  },

  delete: (id: number, deleteBy: string) => {
    return `
      UPDATE DEPARTMENTS 
      SET INUSE = 0, UPDATE_BY = '${deleteBy}', UPDATE_DATE = NOW()
      WHERE ID = ${id}
    `;
  },

  getHierarchy: () => {
    return `
      WITH RECURSIVE dept_tree AS (
        SELECT ID, CODE, NAME, PARENT_ID, 0 as level
        FROM DEPARTMENTS
        WHERE PARENT_ID IS NULL AND INUSE = 1
        
        UNION ALL
        
        SELECT d.ID, d.CODE, d.NAME, d.PARENT_ID, dt.level + 1
        FROM DEPARTMENTS d
        JOIN dept_tree dt ON d.PARENT_ID = dt.ID
        WHERE d.INUSE = 1
      )
      SELECT * FROM dept_tree ORDER BY level, NAME
    `;
  },
};
