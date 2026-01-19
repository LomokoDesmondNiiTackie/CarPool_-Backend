import { Router } from "express";
import { profileRiderController } from "./rider.profile.controller";

const router = Router();

// ROUTE TO UPDATE RIDER INFORMATION
router.post("/rider/profile", profileRiderController);

export default router;