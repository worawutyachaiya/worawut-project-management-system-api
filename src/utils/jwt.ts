import jwt, { JwtPayload } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export interface TokenPayload extends JwtPayload {
  userId: number;
  uuid: string;
  email: string;
  roles: string[];
}

export interface RefreshTokenPayload extends JwtPayload {
  userId: number;
  tokenId: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-me";
// Use numeric values in seconds
const ACCESS_EXPIRES_SECONDS = 15 * 60; // 15 minutes
const REFRESH_EXPIRES_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const JWTHelper = {
  generateAccessToken: (payload: Omit<TokenPayload, "iat" | "exp">): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES_SECONDS });
  },

  generateRefreshToken: (
    userId: number,
  ): { token: string; tokenId: string } => {
    const tokenId = uuidv4();
    const token = jwt.sign({ userId, tokenId }, JWT_SECRET, {
      expiresIn: REFRESH_EXPIRES_SECONDS,
    });
    return { token, tokenId };
  },

  verifyAccessToken: (token: string): TokenPayload | null => {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      return null;
    }
  },

  verifyRefreshToken: (token: string): RefreshTokenPayload | null => {
    try {
      return jwt.verify(token, JWT_SECRET) as RefreshTokenPayload;
    } catch (error) {
      return null;
    }
  },

  decodeToken: (token: string): TokenPayload | null => {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch (error) {
      return null;
    }
  },
};
