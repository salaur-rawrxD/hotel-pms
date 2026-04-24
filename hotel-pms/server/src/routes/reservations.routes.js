import { Router } from "express";

import * as ctrl from "../controllers/reservations.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  createReservationSchema,
  updateReservationSchema,
} from "../schemas/reservation.schema.js";

const router = Router();

router.use(authenticate);

router.get("/", ctrl.listReservations);
router.get("/:id", ctrl.getReservation);

router.post(
  "/",
  authorize("ADMIN", "MANAGER", "FRONT_DESK"),
  validate(createReservationSchema),
  ctrl.createReservation,
);

router.patch(
  "/:id",
  authorize("ADMIN", "MANAGER", "FRONT_DESK"),
  validate(updateReservationSchema),
  ctrl.updateReservation,
);

router.delete(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  ctrl.deleteReservation,
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

export default router;
