import { Router } from "express";

import * as dashboardController from "../controllers/dashboard.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/summary", dashboardController.getSummary);
router.get("/revenue-chart", dashboardController.getRevenueChart);
router.get("/arrivals-today", dashboardController.getArrivalsToday);
router.get("/departures-today", dashboardController.getDeparturesToday);
router.get("/alerts", dashboardController.getAlerts);
router.get("/room-grid", dashboardController.getRoomGrid);

export default router;
