import { Router } from "express";

import * as ctrl from "../controllers/guests.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  createGuestSchema,
  updateGuestSchema,
} from "../schemas/guest.schema.js";

const router = Router();

router.use(authenticate);

router.get("/", ctrl.listGuests);
router.get("/:id", ctrl.getGuest);
router.post(
  "/",
  authorize("ADMIN", "MANAGER", "FRONT_DESK"),
  validate(createGuestSchema),
  ctrl.createGuest,
);
router.patch(
  "/:id",
  authorize("ADMIN", "MANAGER", "FRONT_DESK"),
  validate(updateGuestSchema),
  ctrl.updateGuest,
);

export default router;
