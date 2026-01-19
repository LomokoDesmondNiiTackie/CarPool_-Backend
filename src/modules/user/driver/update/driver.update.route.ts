import { Router } from "express";
import { updateDriverController } from "./driver.update.controller";

const router = Router();

// ROUTE TO UPDATE DRIVER INFORMATION
router.put("/driver/update", updateDriverController);

export default router;