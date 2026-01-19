import { Router } from "express";
import { updateRiderController } from "./rider.update.controller";

const router = Router();

// ROUTE TO UPDATE RIDER INFORMATION
router.put("/rider/update", updateRiderController);

export default router;