import express from "express";
import {
  createEscrow,
  fetchUserEscrow,
  getTransactionById,
  userDashboard,
} from "../controllers/EscrowController";

const router = express.Router();

router.post("/create", createEscrow);
router.get("/", fetchUserEscrow);
router.get("/dashboard", userDashboard);
router.get("/transaction", getTransactionById);

export default router;
