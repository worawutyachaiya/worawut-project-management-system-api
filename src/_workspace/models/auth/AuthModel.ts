import { AuthService } from "@services/auth/AuthService.js";

export const AuthModel = {
  login: async (email: string, password: string) => {
    console.log("[AuthModel] Login attempt for:", email);

    // Find user
    const user = await AuthService.findUserByEmail(email);
    console.log(
      "[AuthModel] User found:",
      user ? { ID: user.ID, EMAIL: user.EMAIL } : null,
    );

    if (!user) {
      console.log("[AuthModel] User not found");
      return { success: false, message: "Invalid credentials" };
    }

    // Verify password
    console.log("[AuthModel] Verifying password...");
    console.log("[AuthModel] PASSWORD_HASH from DB:", user.PASSWORD_HASH);
    const isValid = await AuthService.verifyPassword(
      password,
      user.PASSWORD_HASH,
    );
    console.log("[AuthModel] Password valid:", isValid);

    if (!isValid) {
      return { success: false, message: "Invalid credentials" };
    }

    // Get roles
    const roles = await AuthService.getUserRoles(user.ID);

    // Update last login
    await AuthService.updateLastLogin(user.ID);

    return {
      success: true,
      user: {
        id: user.ID,
        uuid: user.UUID,
        employeeCode: user.EMPLOYEE_CODE,
        email: user.EMAIL,
        firstName: user.FIRST_NAME,
        lastName: user.LAST_NAME,
        phone: user.PHONE,
        avatarUrl: user.AVATAR_URL,
        departmentId: user.DEPARTMENT_ID,
        departmentName: user.DEPARTMENT_NAME,
        supervisorId: user.SUPERVISOR_ID,
        status: user.STATUS,
      },
      roles: roles.map((r) => ({
        id: r.ID,
        code: r.CODE,
        name: r.NAME,
        level: r.LEVEL,
      })),
    };
  },

  getCurrentUser: async (userId: number) => {
    const user = await AuthService.findUserById(userId);
    if (!user) {
      return null;
    }

    const roles = await AuthService.getUserRoles(userId);

    return {
      id: user.ID,
      uuid: user.UUID,
      employeeCode: user.EMPLOYEE_CODE,
      email: user.EMAIL,
      firstName: user.FIRST_NAME,
      lastName: user.LAST_NAME,
      phone: user.PHONE,
      avatarUrl: user.AVATAR_URL,
      departmentId: user.DEPARTMENT_ID,
      departmentName: user.DEPARTMENT_NAME,
      supervisorId: user.SUPERVISOR_ID,
      status: user.STATUS,
      roles: roles.map((r) => ({
        id: r.ID,
        code: r.CODE,
        name: r.NAME,
        level: r.LEVEL,
      })),
    };
  },

  saveRefreshToken: async (
    userId: number,
    token: string,
    deviceInfo: string,
    ipAddress: string,
  ) => {
    const tokenHash = AuthService.hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await AuthService.saveRefreshToken(
      userId,
      tokenHash,
      expiresAt,
      deviceInfo,
      ipAddress,
    );
  },

  validateRefreshToken: async (token: string) => {
    const tokenHash = AuthService.hashToken(token);
    const tokenRecord = await AuthService.findRefreshToken(tokenHash);
    return tokenRecord;
  },

  revokeRefreshToken: async (token: string) => {
    const tokenHash = AuthService.hashToken(token);
    await AuthService.revokeRefreshToken(tokenHash);
  },

  revokeAllTokens: async (userId: number) => {
    await AuthService.revokeAllUserTokens(userId);
  },

  changePassword: async (
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) => {
    const user = await AuthService.findUserById(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const isValid = await AuthService.verifyPassword(
      oldPassword,
      user.PASSWORD_HASH,
    );
    if (!isValid) {
      return { success: false, message: "Current password is incorrect" };
    }

    await AuthService.updatePassword(userId, newPassword);
    await AuthService.revokeAllUserTokens(userId);

    return { success: true, message: "Password changed successfully" };
  },
};
