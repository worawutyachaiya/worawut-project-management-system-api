import { ResponseI } from "@src/types/ResponseI.js";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("Error:", err);

  const statusCode =
    err.statusCode || res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    Status: false,
    Message: err.message || "Unknown error",
    ResultOnDb:
      process.env.NODE_ENV === "development" ? { stack: err.stack } : [],
    MethodOnDb: "errorHandler",
    TotalCountOnDb: 0,
  } as ResponseI);
};
