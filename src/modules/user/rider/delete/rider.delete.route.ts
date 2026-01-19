import { Router } from "express";
import { riderDeleteController } from "./rider.delete.controller";


const router = Router();

// ROUTE TO DELETE RIDER ACCOUNT
router.delete("/rider/delete", riderDeleteController);

export default router;