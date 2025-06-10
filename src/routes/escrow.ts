import express from "express";
import {
  createEscrow,
  fetchUserEscrow,
  getTransactionById,
  userDashboard,
} from "../controllers/EscrowController";
import { fetchuser } from "../middlewares/fetchuser";

const router = express.Router();

router.post("/create", fetchuser, createEscrow);
router.get("/", fetchuser, fetchUserEscrow);
router.get("/dashboard", fetchuser, userDashboard);
router.get("/transaction", fetchuser, getTransactionById);

export default router;
