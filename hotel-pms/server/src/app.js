import "dotenv/config";
import "express-async-errors";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
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

function parseOriginList(value) {
  if (!value || typeof value !== "string") return [];
  return value
    .split(/[, \n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function isFairbridgeVercelOrigin(origin) {
  try {
    const { hostname } = new URL(origin);
    if (!hostname.endsWith(".vercel.app")) return false;
    return /fairbridge|hotel-pms/i.test(hostname);
  } catch {
    return false;
  }
}

/** Any Vercel host (*.vercel.app) — previews often use org/user slugs with no "fairbridge" in the name. */
function isVercelAppOrigin(origin) {
  try {
    return new URL(origin).hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

export function createApp() {
  const app = express();

  const allowedOrigins = new Set([
    "http://localhost:5173",
    "http://localhost:4173",
    ...parseOriginList(process.env.CLIENT_URL),
    ...parseOriginList(process.env.CLIENT_ORIGIN),
  ]);

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          allowedOrigins.has(origin) ||
          isFairbridgeVercelOrigin(origin) ||
          (process.env.VERCEL && isVercelAppOrigin(origin))
        ) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
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
  app.use("/api/dashboard", dashboardRoutes);
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
