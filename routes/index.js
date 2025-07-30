import express from "express";
import AuthRoutes from "./AuthRoutes.js";
import TruckRoutes from "./TruckRoutes.js";
import SparePartRoutes from "./SparePartRoutes.js";
import UserRoutes from "./UserRoutes.js";
import UsedPartsRoutes from "./UsedPartRoutes.js";
import LoadRoutes from "./LoadRoutes.js";
import DashboardRoutes from "./DashboardRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import AsyncWrapper from "../utils/AsyncWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Health check endpoint to check server status
router.get("/health", (req, res) => {
  return res.status(200).json({ message: "Server is up and running" });
});

router.use("/dashboard", DashboardRoutes);
router.use("/auth", AuthRoutes);
router.use("/user", UserRoutes);
router.use("/truck", TruckRoutes);
router.use("/spare_part", SparePartRoutes);
router.use("/use_part", UsedPartsRoutes);
router.use("/load", LoadRoutes);

router.get(
  "/file/:fileName",
  AsyncWrapper(async (req, res, next) => {
    const { fileName } = req.params;
    if (!fileName) {
      return next(new ErrorHandler("File name is required", 400));
    }
    const filePath = path.join(__dirname, `../uploads/${fileName}`);
    console.log(filePath);
    if (!existsSync(filePath)) {
      console.log("File not found");
      return;
    }
    res.sendFile(filePath);
  })
);

export default router;
