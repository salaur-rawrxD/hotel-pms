import { Router } from "express";

import * as ctrl from "../controllers/housekeeping.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  createTaskSchema,
  updateTaskSchema,
} from "../schemas/housekeeping.schema.js";

const router = Router();

router.use(authenticate);

router.get("/tasks", ctrl.listTasks);
router.post(
  "/tasks",
  authorize("ADMIN", "MANAGER", "HOUSEKEEPING"),
  validate(createTaskSchema),
  ctrl.createTask,
);
router.patch(
  "/tasks/:id",
  authorize("ADMIN", "MANAGER", "HOUSEKEEPING"),
  validate(updateTaskSchema),
  ctrl.updateTask,
);

export default router;
