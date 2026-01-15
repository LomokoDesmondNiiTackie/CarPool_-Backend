import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { updateRiderController } from "./rider.update.controller";

const router = Router();

// ROUTE TO UPDATE RIDER INFORMATION
router.put("/rider/update", requireAuth(), updateRiderController);

export default router;