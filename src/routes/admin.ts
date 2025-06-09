import express from "express";
import { updateProfile } from "../controllers/SettingsController";
import { fetchuser } from "../middlewares/fetchuser";
import { getDashboardData } from "../controllers/AdminController";

const router = express.Router();

router.get("/dashboard", getDashboardData);

export default router;
