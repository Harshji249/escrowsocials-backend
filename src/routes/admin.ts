import express from "express";
import { updateProfile } from "../controllers/SettingsController";
import { fetchuser } from "../middlewares/fetchuser";
import { fetchAllEscrows, getDashboardData } from "../controllers/AdminController";

const router = express.Router();

router.get("/dashboard", getDashboardData);
router.get("/escrows", fetchAllEscrows);

export default router;
