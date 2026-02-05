export const AuthSQL = {
  findByEmail: (email: string) => {
    return `
      SELECT 
        u.ID,
        u.UUID,
        u.EMPLOYEE_CODE,
        u.EMAIL,
        u.PASSWORD_HASH,
        u.FIRST_NAME,
        u.LAST_NAME,
        u.PHONE,
        u.AVATAR_URL,
        u.DEPARTMENT_ID,
        u.SUPERVISOR_ID,
        u.STATUS,
        d.NAME as DEPARTMENT_NAME
      FROM USERS u
      LEFT JOIN DEPARTMENTS d ON u.DEPARTMENT_ID = d.ID AND d.INUSE = 1
      WHERE u.EMAIL = '${email}'
        AND u.INUSE = 1
        AND u.STATUS = 'ACTIVE'
    `;
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
        d.NAME as DEPARTMENT_NAME
      FROM USERS u
      LEFT JOIN DEPARTMENTS d ON u.DEPARTMENT_ID = d.ID AND d.INUSE = 1
      WHERE u.ID = ${id}
        AND u.INUSE = 1
    `;
  },

  getUserRoles: (userId: number) => {
    return `
      SELECT 
        r.ID,
        r.CODE,
        r.NAME,
        r.LEVEL
      FROM USER_ROLES ur
      JOIN ROLES r ON ur.ROLE_ID = r.ID AND r.INUSE = 1
      WHERE ur.USER_ID = ${userId}
        AND ur.INUSE = 1
    `;
  },

  updateLastLogin: (userId: number) => {
    return `
      UPDATE USERS 
      SET LAST_LOGIN_AT = NOW()
      WHERE ID = ${userId}
    `;
  },

  saveRefreshToken: (
    userId: number,
    tokenHash: string,
    expiresAt: string,
    deviceInfo: string,
    ipAddress: string,
  ) => {
    return `
      INSERT INTO REFRESH_TOKENS (USER_ID, TOKEN_HASH, EXPIRES_AT, DEVICE_INFO, IP_ADDRESS, CREATE_DATE)
      VALUES (${userId}, '${tokenHash}', '${expiresAt}', '${deviceInfo}', '${ipAddress}', NOW())
    `;
  },

  findRefreshToken: (tokenHash: string) => {
    return `
      SELECT ID, USER_ID, EXPIRES_AT, IS_REVOKED
      FROM REFRESH_TOKENS
      WHERE TOKEN_HASH = '${tokenHash}'
        AND IS_REVOKED = 0
        AND EXPIRES_AT > NOW()
    `;
  },

  revokeRefreshToken: (tokenHash: string) => {
    return `
      UPDATE REFRESH_TOKENS
      SET IS_REVOKED = 1
      WHERE TOKEN_HASH = '${tokenHash}'
    `;
  },

  revokeAllUserTokens: (userId: number) => {
    return `
      UPDATE REFRESH_TOKENS
      SET IS_REVOKED = 1
      WHERE USER_ID = ${userId}
        AND IS_REVOKED = 0
    `;
  },

  updatePassword: (userId: number, passwordHash: string) => {
    return `
      UPDATE USERS
      SET PASSWORD_HASH = '${passwordHash}',
          UPDATE_DATE = NOW()
      WHERE ID = ${userId}
    `;
  },
};
