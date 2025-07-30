import { col, fn, literal, Op } from "sequelize";
import LoadTruck from "../models/LoadTruckModel.js";
import User from "../models/UserModel.js";
import AsyncWrapper from "../utils/AsyncWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import SuccessMessage from "../utils/SuccessMessage.js";
import Truck from "../models/TruckModel.js";
import SparePart from "../models/SparePartModel.js";

export const getDashboardSummary = AsyncWrapper(async (req, res, next) => {
  const [totalRevenue, totalUsers, totalTrucks, totalSpareParts] =
    await Promise.all([
      LoadTruck.sum("amount"),
      User.count({
        where: {
          role: { [Op.ne]: "SUPER_ADMIN" },
        },
      }),
      Truck.count(),
      SparePart.sum("quantity"),
    ]);

  return SuccessMessage(res, "Dashboard summary fetched successfully", {
    totalRevenue: totalRevenue || 0,
    totalUsers,
    totalTrucks,
    totalSpareParts: totalSpareParts || 0,
  });
});

export const getChartData = AsyncWrapper(async (req, res) => {
  const currentYear = new Date().getFullYear();

  const loads = await LoadTruck.findAll({
    attributes: [
      [fn("MONTH", col("date")), "month"],
      [fn("SUM", col("amount")), "total"],
    ],
    where: {
      date: {
        [Op.gte]: new Date(`${currentYear}-01-01`),
        [Op.lte]: new Date(`${currentYear}-12-31`),
      },
    },
    group: [literal("MONTH(date)")],
    raw: true,
  });

  // Initialize all 12 months with 0 total
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    name: new Date(0, i).toLocaleString("default", { month: "short" }),
    total: 0,
  }));

  // Populate actual totals
  loads.forEach(({ month, total }) => {
    monthlyData[month - 1].total = parseFloat(total);
  });

  const latestTrucks = await Truck.findAll({
    limit: 5,
    order: [["createdAt", "DESC"]],
    raw: true,
  });

  return SuccessMessage(res, "Dashboard data fetched successfully", {
    monthlyData,
    latestTrucks,
  });
});
