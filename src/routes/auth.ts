import express from "express";
import { createUser, verifyEmail } from "../controllers/AuthControllers";

const router = express.Router();

router.post("/onboarding", createUser);
router.get("/verify", verifyEmail);

export default router;
