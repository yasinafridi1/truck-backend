import express from "express";
import AuthRoutes from "./AuthRoutes.js";
import TruckRoutes from "./TruckRoutes.js";
import SparePartRoutes from "./SparePartRoutes.js";
import UserRoutes from "./UserRoutes.js";
import UsedPartsRoutes from "./UsedPartRoutes.js";
import LoadRoutes from "./LoadRoutes.js";
const router = express.Router();

// Health check endpoint to check server status
router.get("/health", (req, res) => {
  return res.status(200).json({ message: "Server is up and running" });
});

router.use("/auth", AuthRoutes);
router.use("/user", UserRoutes);
router.use("/truck", TruckRoutes);
router.use("/spare_part", SparePartRoutes);
router.use("/use_part", UsedPartsRoutes);
router.use("/load", LoadRoutes);

export default router;
