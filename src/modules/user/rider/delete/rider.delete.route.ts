import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { riderDeleteController } from "./rider.delete.controller";


const router = Router();

// ROUTE TO DELETE RIDER ACCOUNT
router.delete("/rider/delete", requireAuth(), riderDeleteController);

export default router;