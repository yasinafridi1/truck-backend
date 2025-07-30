import express from "express";
import {
  getChartData,
  getDashboardSummary,
} from "../controllers/DashboardController.js";
const router = express.Router();

router.get("/summary", getDashboardSummary);
router.get("/chart", getChartData);

export default router;
