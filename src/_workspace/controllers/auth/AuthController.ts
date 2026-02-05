import { Request, Response } from "express";
import { AuthModel } from "@models/auth/AuthModel.js";
import { JWTHelper } from "@src/utils/jwt.js";
import { ResponseI } from "@src/types/ResponseI.js";
import { StatusCodes } from "http-status-codes";

export const AuthController = {
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const result = await AuthModel.login(email, password);

      if (!result.success) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          Status: false,
          Message: result.message,
          ResultOnDb: [],
          MethodOnDb: "login",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      // Generate tokens
      const accessToken = JWTHelper.generateAccessToken({
        userId: result.user!.id,
        uuid: result.user!.uuid,
        email: result.user!.email,
        roles: result.roles!.map((r) => r.code),
      });

      const { token: refreshToken } = JWTHelper.generateRefreshToken(
        result.user!.id,
      );

      // Save refresh token
      const deviceInfo = req.headers["user-agent"] || "unknown";
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
      await AuthModel.saveRefreshToken(
        result.user!.id,
        refreshToken,
        deviceInfo,
        ipAddress,
      );

      // Set refresh token as httpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.json({
        Status: true,
        Message: "Login successful",
        ResultOnDb: {
          user: result.user,
          roles: result.roles,
          accessToken,
        },
        MethodOnDb: "login",
        TotalCountOnDb: 1,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "login",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  logout: async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        await AuthModel.revokeRefreshToken(refreshToken);
      }

      res.clearCookie("refreshToken");

      return res.json({
        Status: true,
        Message: "Logout successful",
        ResultOnDb: [],
        MethodOnDb: "logout",
        TotalCountOnDb: 0,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "logout",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  refresh: async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          Status: false,
          Message: "Refresh token required",
          ResultOnDb: [],
          MethodOnDb: "refresh",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      // Verify refresh token structure
      const payload = JWTHelper.verifyRefreshToken(refreshToken);
      if (!payload) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          Status: false,
          Message: "Invalid refresh token",
          ResultOnDb: [],
          MethodOnDb: "refresh",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      // Validate in database
      const tokenRecord = await AuthModel.validateRefreshToken(refreshToken);
      if (!tokenRecord) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          Status: false,
          Message: "Refresh token expired or revoked",
          ResultOnDb: [],
          MethodOnDb: "refresh",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      // Get user data
      const user = await AuthModel.getCurrentUser(payload.userId);
      if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          Status: false,
          Message: "User not found",
          ResultOnDb: [],
          MethodOnDb: "refresh",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      // Generate new access token
      const accessToken = JWTHelper.generateAccessToken({
        userId: user.id,
        uuid: user.uuid,
        email: user.email,
        roles: user.roles.map((r) => r.code),
      });

      return res.json({
        Status: true,
        Message: "Token refreshed",
        ResultOnDb: { accessToken },
        MethodOnDb: "refresh",
        TotalCountOnDb: 1,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "refresh",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  me: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          Status: false,
          Message: "Not authenticated",
          ResultOnDb: [],
          MethodOnDb: "me",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      const user = await AuthModel.getCurrentUser(userId);

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          Status: false,
          Message: "User not found",
          ResultOnDb: [],
          MethodOnDb: "me",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      return res.json({
        Status: true,
        Message: "User retrieved",
        ResultOnDb: user,
        MethodOnDb: "me",
        TotalCountOnDb: 1,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "me",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },

  changePassword: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { oldPassword, newPassword } = req.body;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          Status: false,
          Message: "Not authenticated",
          ResultOnDb: [],
          MethodOnDb: "changePassword",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      const result = await AuthModel.changePassword(
        userId,
        oldPassword,
        newPassword,
      );

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          Status: false,
          Message: result.message,
          ResultOnDb: [],
          MethodOnDb: "changePassword",
          TotalCountOnDb: 0,
        } as ResponseI);
      }

      res.clearCookie("refreshToken");

      return res.json({
        Status: true,
        Message: result.message,
        ResultOnDb: [],
        MethodOnDb: "changePassword",
        TotalCountOnDb: 0,
      } as ResponseI);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        Status: false,
        Message: err.message,
        ResultOnDb: [],
        MethodOnDb: "changePassword",
        TotalCountOnDb: 0,
      } as ResponseI);
    }
  },
};
