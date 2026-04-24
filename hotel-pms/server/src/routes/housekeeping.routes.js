import { Router } from "express";

import * as ctrl from "../controllers/housekeeping.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.use(authenticate);

// ── boards & queues ────────────────────────────────────────
router.get("/assignments",        ctrl.getAssignments);
router.get("/floor-map",          ctrl.getFloorMap);
router.get("/inspection-queue",   ctrl.getInspectionQueue);

// ── tasks + checklists ─────────────────────────────────────
router.get("/tasks/:id/checklist", ctrl.getTaskChecklist);
router.patch("/tasks/:id/status",  ctrl.updateTaskStatus);
router.post(
  "/tasks/assign",
  authorize("ADMIN", "MANAGER"),
  ctrl.assignTask,
);

router.patch(
  "/checklist/:checklistId/items/:itemId",
  ctrl.updateChecklistItem,
);

// ── lost & found ───────────────────────────────────────────
router.get("/lost-and-found",       ctrl.getLostAndFound);
router.post("/lost-and-found",      ctrl.createLostAndFound);
router.patch("/lost-and-found/:id", ctrl.updateLostAndFound);

// ── maintenance ────────────────────────────────────────────
router.get("/maintenance",          ctrl.getMaintenanceRequests);
router.post("/maintenance",         ctrl.createMaintenanceRequest);
router.patch(
  "/maintenance/:id",
  authorize("ADMIN", "MANAGER"),
  ctrl.updateMaintenanceRequest,
);

// ── supplies ───────────────────────────────────────────────
router.get("/supplies",             ctrl.getSupplyRequests);
router.post("/supplies",            ctrl.createSupplyRequest);
router.patch(
  "/supplies/:id",
  authorize("ADMIN", "MANAGER"),
  ctrl.updateSupplyRequest,
);

export default router;
