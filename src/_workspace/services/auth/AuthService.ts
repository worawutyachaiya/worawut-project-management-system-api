import { MySQLExecute } from "@businessData/dbExecute.js";
import { AuthSQL } from "@sql/auth/AuthSQL.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface UserRecord {
  ID: number;
  UUID: string;
  EMPLOYEE_CODE: string;
  EMAIL: string;
  PASSWORD_HASH: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  PHONE: string | null;
  AVATAR_URL: string | null;
  DEPARTMENT_ID: number | null;
  SUPERVISOR_ID: number | null;
  STATUS: string;
  DEPARTMENT_NAME: string | null;
}

export interface RoleRecord {
  ID: number;
  CODE: string;
  NAME: string;
  LEVEL: number;
}

export const AuthService = {
  findUserByEmail: async (email: string): Promise<UserRecord | null> => {
    const sql = AuthSQL.findByEmail(email);
    return await MySQLExecute.searchOne<UserRecord>(sql);
  },

  findUserById: async (id: number): Promise<UserRecord | null> => {
    const sql = AuthSQL.findById(id);
    return await MySQLExecute.searchOne<UserRecord>(sql);
  },

  getUserRoles: async (userId: number): Promise<RoleRecord[]> => {
    const sql = AuthSQL.getUserRoles(userId);
    return await MySQLExecute.search<RoleRecord>(sql);
  },

  verifyPassword: async (
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  hashPassword: async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 12);
  },

  updateLastLogin: async (userId: number): Promise<void> => {
    const sql = AuthSQL.updateLastLogin(userId);
    await MySQLExecute.execute(sql);
  },

  hashToken: (token: string): string => {
    return crypto.createHash("sha256").update(token).digest("hex");
  },

  saveRefreshToken: async (
    userId: number,
    tokenHash: string,
    expiresAt: Date,
    deviceInfo: string,
    ipAddress: string,
  ): Promise<void> => {
    const expiresAtStr = expiresAt.toISOString().slice(0, 19).replace("T", " ");
    const sql = AuthSQL.saveRefreshToken(
      userId,
      tokenHash,
      expiresAtStr,
      deviceInfo,
      ipAddress,
    );
    await MySQLExecute.execute(sql);
  },

  findRefreshToken: async (tokenHash: string): Promise<any | null> => {
    const sql = AuthSQL.findRefreshToken(tokenHash);
    return await MySQLExecute.searchOne(sql);
  },

  revokeRefreshToken: async (tokenHash: string): Promise<void> => {
    const sql = AuthSQL.revokeRefreshToken(tokenHash);
    await MySQLExecute.execute(sql);
  },

  revokeAllUserTokens: async (userId: number): Promise<void> => {
    const sql = AuthSQL.revokeAllUserTokens(userId);
    await MySQLExecute.execute(sql);
  },

  updatePassword: async (
    userId: number,
    newPassword: string,
  ): Promise<void> => {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    const sql = AuthSQL.updatePassword(userId, passwordHash);
    await MySQLExecute.execute(sql);
  },
};
