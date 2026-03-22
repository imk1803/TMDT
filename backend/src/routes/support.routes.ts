import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import * as supportController from "../controllers/support.controller";

const router = Router();

// These routes require authentication
router.use(authenticate);

// User/Client/Freelancer endpoints
router.post("/", supportController.createTicket);
router.get("/my", supportController.getMyTickets);
router.get("/:id", supportController.getTicketDetail);
router.post("/:id/message", supportController.replyToTicket);

export default router;
