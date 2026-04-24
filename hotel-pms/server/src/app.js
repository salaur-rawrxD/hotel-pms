import "express-async-errors";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import reservationsRoutes from "./routes/reservations.routes.js";
import roomsRoutes from "./routes/rooms.routes.js";
import guestsRoutes from "./routes/guests.routes.js";
import ratesRoutes from "./routes/rates.routes.js";
import housekeepingRoutes from "./routes/housekeeping.routes.js";
import channelsRoutes from "./routes/channels.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import usersRoutes from "./routes/users.routes.js";
import frontdeskRoutes from "./routes/frontdesk.routes.js";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  if (process.env.NODE_ENV !== "test") {
    app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  }

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts. Please try again later." },
  });

  app.get("/api/health", (_req, res) =>
    res.json({ status: "ok", time: new Date().toISOString() }),
  );

  app.use("/api/auth", authLimiter, authRoutes);
  app.use("/api/reservations", reservationsRoutes);
  app.use("/api/rooms", roomsRoutes);
  app.use("/api/guests", guestsRoutes);
  app.use("/api", ratesRoutes);
  app.use("/api/housekeeping", housekeepingRoutes);
  app.use("/api/channels", channelsRoutes);
  app.use("/api/reports", reportsRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/frontdesk", frontdeskRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
