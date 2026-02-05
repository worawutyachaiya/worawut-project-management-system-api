import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { ResponseI } from "@src/types/ResponseI.js";
import { StatusCodes } from "http-status-codes";

export function validateData(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue: any) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        res.status(StatusCodes.BAD_REQUEST).json({
          Status: false,
          Message: "Validation failed",
          ResultOnDb: errorMessages,
          MethodOnDb: "validateData",
          TotalCountOnDb: 0,
        } as ResponseI);
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          Status: false,
          Message: "Internal Server Error",
          ResultOnDb: [],
          MethodOnDb: "validateData",
          TotalCountOnDb: 0,
        } as ResponseI);
      }
    }
  };
}

export function validateQuery(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue: any) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        res.status(StatusCodes.BAD_REQUEST).json({
          Status: false,
          Message: "Query validation failed",
          ResultOnDb: errorMessages,
          MethodOnDb: "validateQuery",
          TotalCountOnDb: 0,
        } as ResponseI);
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          Status: false,
          Message: "Internal Server Error",
          ResultOnDb: [],
          MethodOnDb: "validateQuery",
          TotalCountOnDb: 0,
        } as ResponseI);
      }
    }
  };
}
