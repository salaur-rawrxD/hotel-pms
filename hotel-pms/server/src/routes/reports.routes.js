import { Router } from "express";

import * as ctrl from "../controllers/reports.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.use(authenticate, authorize("ADMIN", "MANAGER"));

router.get("/daily-summary", ctrl.dailySummary);
router.get("/occupancy", ctrl.occupancy);
router.get("/revenue", ctrl.revenue);
router.get("/arrivals-departures", ctrl.arrivalsDepartures);

export default router;
