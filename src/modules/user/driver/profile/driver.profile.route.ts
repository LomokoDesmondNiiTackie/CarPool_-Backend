import { Router } from "express";
import { profileDriverController } from "./driver.profile.controller";

const router = Router();

// ROUTE TO UPDATE RIDER INFORMATION
router.post("/driver/profile", profileDriverController);

export default router;