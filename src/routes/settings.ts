import express from "express";
import {
  fetchBankInfo,
  updateBankInfo,
  updatePassword,
  updateProfile,
  verifyEmail,
} from "../controllers/SettingsController";
import { fetchuser } from "../middlewares/fetchuser";

const router = express.Router();

router.put("/profile", fetchuser, updateProfile);
router.put("/password", fetchuser, updatePassword);
router.post("/bank", fetchuser, updateBankInfo);
router.get("/bank", fetchuser, fetchBankInfo);
router.get("/verify", verifyEmail);

export default router;
