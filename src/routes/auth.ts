import express from "express";
import {
  createUser,
  loginUser,
  verifyEmail,
} from "../controllers/AuthControllers";

const router = express.Router();

router.post("/onboarding", createUser);
router.get("/verify", verifyEmail);
router.post("/login", loginUser);

export default router;
