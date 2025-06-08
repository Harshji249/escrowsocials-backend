import express from "express";
import {
  createEscrow,
  fetchUserEscrow,
  userDashboard,
} from "../controllers/EscrowController";

const router = express.Router();

router.post("/create", createEscrow);
router.get("/", fetchUserEscrow);
router.get("/dashboard", userDashboard);

export default router;
