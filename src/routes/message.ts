import express from "express";
import { createMessage, getMessagesByEscrow } from "../controllers/MessageController";
const router = express.Router();

router.post("/", createMessage);
router.get("/:escrowId", getMessagesByEscrow);

export default router;
