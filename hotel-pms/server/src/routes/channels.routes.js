import { Router } from "express";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.use(authenticate, authorize("ADMIN", "MANAGER"));

router.get("/", (_req, res) => {
  res.json({
    message: "Channel integrations will be configured here.",
    channels: [
      { code: "DIRECT", enabled: true },
      { code: "EXPEDIA", enabled: false },
      { code: "BOOKING", enabled: false },
      { code: "AIRBNB", enabled: false },
      { code: "CORPORATE", enabled: true },
    ],
  });
});

export default router;
