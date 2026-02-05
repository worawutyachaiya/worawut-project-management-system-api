export const RolesSQL = {
  search: (dataItem: any) => {
    let sql = `
      SELECT 
        r.ID,
        r.CODE,
        r.NAME,
        r.DESCRIPTION,
        r.LEVEL,
        r.CREATE_DATE,
        (SELECT COUNT(*) FROM USER_ROLES ur WHERE ur.ROLE_ID = r.ID AND ur.INUSE = 1) as USER_COUNT
      FROM ROLES r
      WHERE r.INUSE = 1
    `;

    if (dataItem?.ID) sql += ` AND r.ID = ${dataItem.ID} `;
    if (dataItem?.CODE) sql += ` AND r.CODE LIKE '%${dataItem.CODE}%' `;
    if (dataItem?.NAME) sql += ` AND r.NAME LIKE '%${dataItem.NAME}%' `;

    sql += ` ORDER BY r.LEVEL ASC, r.NAME ASC `;

    return sql;
  },

  findById: (id: number) => {
    return `SELECT * FROM ROLES WHERE ID = ${id} AND INUSE = 1`;
  },

  create: (dataItem: any) => {
    return `
      INSERT INTO ROLES (CODE, NAME, DESCRIPTION, LEVEL, CREATE_BY, CREATE_DATE)
      VALUES (
        '${dataItem.CODE}',
        '${dataItem.NAME}',
        ${dataItem.DESCRIPTION ? `'${dataItem.DESCRIPTION}'` : "NULL"},
        ${dataItem.LEVEL || 0},
        '${dataItem.CREATE_BY}',
        NOW()
      )
    `;
  },

  update: (dataItem: any) => {
    let sql = `UPDATE ROLES SET UPDATE_DATE = NOW(), UPDATE_BY = '${dataItem.UPDATE_BY}'`;

    if (dataItem.CODE) sql += `, CODE = '${dataItem.CODE}'`;
    if (dataItem.NAME) sql += `, NAME = '${dataItem.NAME}'`;
    if (dataItem.DESCRIPTION !== undefined)
      sql += `, DESCRIPTION = ${dataItem.DESCRIPTION ? `'${dataItem.DESCRIPTION}'` : "NULL"}`;
    if (dataItem.LEVEL !== undefined) sql += `, LEVEL = ${dataItem.LEVEL}`;

    sql += ` WHERE ID = ${dataItem.ID}`;

    return sql;
  },

  delete: (id: number, deleteBy: string) => {
    return `UPDATE ROLES SET INUSE = 0, UPDATE_BY = '${deleteBy}', UPDATE_DATE = NOW() WHERE ID = ${id}`;
  },

  // Permissions
  getPermissions: (roleId: number) => {
    return `
      SELECT p.*
      FROM ROLE_PERMISSIONS rp
      JOIN PERMISSIONS p ON rp.PERMISSION_ID = p.ID AND p.INUSE = 1
      WHERE rp.ROLE_ID = ${roleId} AND rp.INUSE = 1
    `;
  },

  getAllPermissions: () => {
    return `SELECT * FROM PERMISSIONS WHERE INUSE = 1 ORDER BY MODULE, NAME`;
  },

  assignPermission: (roleId: number, permissionId: number) => {
    return `
      INSERT INTO ROLE_PERMISSIONS (ROLE_ID, PERMISSION_ID)
      VALUES (${roleId}, ${permissionId})
      ON DUPLICATE KEY UPDATE INUSE = 1
    `;
  },

  removePermission: (roleId: number, permissionId: number) => {
    return `UPDATE ROLE_PERMISSIONS SET INUSE = 0 WHERE ROLE_ID = ${roleId} AND PERMISSION_ID = ${permissionId}`;
  },
};
