import compression from "compression";
import cors from "cors";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import { loadEnvironmentVariables } from "./config/env.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";

// Load environment variables FIRST
loadEnvironmentVariables();

const app = express();
const PORT = process.env.PORT || 3000;
const prefix = `/api/${process.env.APPLICATION_URL || "pms"}`;

async function main() {
  // Middleware
  app.use(compression());
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ limit: "100mb", extended: true }));
  app.use(cookieParser());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true,
    }),
  );

  // Health check
  app.get("/", (_req: Request, res: Response) => {
    res.json({
      status: "running",
      timestamp: new Date().toISOString(),
      api: prefix,
    });
  });

  const { default: Routers } = await import("./_workspace/Routes.js");
  app.use(prefix, Routers as any);

  // Error Handling
  app.all(/.*/, notFoundHandler);
  app.use(errorHandler);

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}${prefix}`); // Ready for requests
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
