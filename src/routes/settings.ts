import express from "express";
import { updateBankInfo, updatePassword, updateProfile, verifyEmail } from "../controllers/SettingsController";
import { fetchuser } from "../middlewares/fetchuser";

const router = express.Router();

router.put("/profile", updateProfile);
router.put("/password", updatePassword);
router.put("/bank", updateBankInfo);
router.get("/verify", verifyEmail);

export default router;