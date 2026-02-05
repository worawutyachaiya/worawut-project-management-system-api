import { ResponseI } from "@src/types/ResponseI.js";
import { Request, Response, NextFunction } from "express";

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.status(404).json({
    Status: false,
    Message: `Route ${req.method} ${req.originalUrl} not found`,
    ResultOnDb: [],
    MethodOnDb: req.method,
    TotalCountOnDb: 0,
  } as ResponseI);
};
