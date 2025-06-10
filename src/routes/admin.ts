import express from "express";
import { updateProfile } from "../controllers/SettingsController";
import { fetchuser } from "../middlewares/fetchuser";
import {
  fetchAllEscrows,
  getDashboardData,
  updateStep,
} from "../controllers/AdminController";

const router = express.Router();

router.get("/dashboard", fetchuser, getDashboardData);
router.get("/escrows", fetchuser, fetchAllEscrows);
router.put("/step", fetchuser, updateStep);

export default router;
