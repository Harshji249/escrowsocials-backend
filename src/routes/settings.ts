import express from "express";
import { updateProfile } from "../controllers/SettingsController";
import { fetchuser } from "../middlewares/fetchuser";

const router = express.Router();

router.put("/profile", fetchuser, updateProfile);

export default router;
