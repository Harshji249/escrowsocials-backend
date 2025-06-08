import express from "express";
import { createEscrow, fetchUserEscrow } from "../controllers/EscrowController";

const router = express.Router();

router.post("/create", createEscrow);
router.get("/", fetchUserEscrow);
// router.post("/login", loginUser);

export default router;
