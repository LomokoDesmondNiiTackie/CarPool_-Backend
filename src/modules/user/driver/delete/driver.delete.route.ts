import { Router } from "express";
import { driverDeleteController } from "./driver.delete.controller";


const router = Router();

// ROUTE TO DELETE RIDER ACCOUNT
router.delete("/driver/delete", driverDeleteController);

export default router;