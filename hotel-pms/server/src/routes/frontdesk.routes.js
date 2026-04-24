import { Router } from "express";

import * as ctrl from "../controllers/frontdesk.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.use(authenticate);

router.get("/arrivals", ctrl.getArrivals);
router.get("/departures", ctrl.getDepartures);
router.get("/in-house", ctrl.getInHouse);
router.get("/night-audit", ctrl.getNightAudit);

router.post(
  "/walk-in",
  authorize("ADMIN", "MANAGER", "FRONT_DESK"),
  ctrl.createWalkIn,
);

router.post(
  "/:id/checkin",
  authorize("ADMIN", "MANAGER", "FRONT_DESK"),
  ctrl.checkIn,
);
router.post(
  "/:id/checkout",
  authorize("ADMIN", "MANAGER", "FRONT_DESK"),
  ctrl.checkOut,
);
router.post(
  "/:id/assign-room",
  authorize("ADMIN", "MANAGER", "FRONT_DESK"),
  ctrl.assignRoom,
);
router.post(
  "/:id/folio/add",
  authorize("ADMIN", "MANAGER", "FRONT_DESK"),
  ctrl.addFolioItem,
);
router.post(
  "/:id/note",
  authorize("ADMIN", "MANAGER", "FRONT_DESK"),
  ctrl.addGuestNote,
);
router.delete(
  "/:id/folio/:itemId",
  authorize("ADMIN", "MANAGER"),
  ctrl.removeFolioItem,
);
router.patch(
  "/:id/quick-action",
  authorize("ADMIN", "MANAGER", "FRONT_DESK"),
  ctrl.updateQuickAction,
);
router.get("/:id/folio", ctrl.getGuestFolio);

export default router;
