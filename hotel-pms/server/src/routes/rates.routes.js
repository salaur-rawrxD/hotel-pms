import { Router } from "express";

import * as ctrl from "../controllers/rates.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  bulkUpsertRatesSchema,
  createRatePlanSchema,
} from "../schemas/rate.schema.js";

const router = Router();

router.use(authenticate);

router.get("/rates", ctrl.listDailyRates);
router.put(
  "/rates",
  authorize("ADMIN", "MANAGER"),
  validate(bulkUpsertRatesSchema),
  ctrl.bulkUpsertDailyRates,
);

router.get("/rateplans", ctrl.listRatePlans);
router.post(
  "/rateplans",
  authorize("ADMIN", "MANAGER"),
  validate(createRatePlanSchema),
  ctrl.createRatePlan,
);

export default router;
