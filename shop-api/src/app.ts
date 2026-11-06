import cors from "cors";
import express from "express";
import { errorHandler } from "./errors.js";
import { router } from "./routes.js";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/api", router);
  app.use(errorHandler);
  return app;
}
