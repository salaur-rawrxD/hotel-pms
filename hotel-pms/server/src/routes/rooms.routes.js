import { Router } from "express";

import * as ctrl from "../controllers/rooms.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { roomStatusSchema } from "../schemas/room.schema.js";

const router = Router();

router.use(authenticate);

router.get("/", ctrl.listRooms);
router.get("/:id", ctrl.getRoom);
router.patch(
  "/:id/status",
  authorize("ADMIN", "MANAGER", "FRONT_DESK", "HOUSEKEEPING"),
  validate(roomStatusSchema),
  ctrl.updateRoomStatus,
);

export default router;
