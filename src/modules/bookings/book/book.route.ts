import { Router } from "express";  
import { bookRideController } from "./book.controller";

const router = Router();

// ROUTE TO BOOK A RIDE
router.post("/bookings/book", bookRideController);

export default router;