import LoadTruck from "../models/LoadTruckModel.js";
import Truck from "../models/TruckModel.js";
import User from "../models/UserModel.js";
import { allLoadsDto, loadTruckDetailDto } from "../services/Dtos.js";
import AsyncWrapper from "../utils/AsyncWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import SuccessMessage from "../utils/SuccessMessage.js";
import { Op } from "sequelize";

export const createLoadTruck = AsyncWrapper(async (req, res, next) => {
  const { date, truckId, from, to } = req.body;

  const truck = await Truck.findByPk(truckId);
  if (!truck) return next(new ErrorHandler("Truck not found", 404));

  const newLoadTruck = await LoadTruck.create({
    date,
    truckId,
    from,
    to,
    addEditBy: req.user.userId,
  });

  const loadTruck = await LoadTruck.findByPk(newLoadTruck.id, {
    include: [
      { model: User, attributes: ["fullName", "email"] },
      { model: Truck },
    ],
  });

  const loadTruckData = allLoadsDto(loadTruck.get({ plain: true }));

  return SuccessMessage(res, "LoadTruck created successfully", {
    loadTruckData,
  });
});

export const getAllLoadTrucks = AsyncWrapper(async (req, res, next) => {
  const { page = 1, limit = 10, search = "", startDate, endDate } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) {
    where[Op.or] = [
      { from: { [Op.like]: `%${search}%` } },
      { to: { [Op.like]: `%${search}%` } },
    ];
  }

  if (startDate) {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    whereConditions.date = {
      [Op.between]: [start, end],
    };
  }

  const { rows, count } = await LoadTruck.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["createdAt", "DESC"]],
    include: [
      { model: User, attributes: ["fullName", "email"] },
      { model: Truck },
    ],
  });

  const loadTrucksData = rows.map((loadTruck) =>
    allLoadsDto(loadTruck.get({ plain: true }))
  );

  return SuccessMessage(res, "LoadTrucks fetched successfully", {
    loadTrucksData,
    page: parseInt(page),
    limit: parseInt(limit),
    totalRecords: count,
    totalPages: Math.ceil(count / limit),
  });
});

export const getLoadTruckDetail = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const loadTruck = await LoadTruck.findByPk(id, {
    include: [
      { model: User, attributes: ["fullName", "email"] },
      { model: Truck },
    ],
  });

  if (!loadTruck) return next(new ErrorHandler("LoadTruck not found", 404));

  const loadTruckData = loadTruckDetailDto(loadTruck.get({ plain: true }));

  return SuccessMessage(res, "LoadTruck details fetched successfully", {
    loadTruckData,
  });
});

export const updateLoadTruck = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { date, truckId, from, to } = req.body;

  const loadTruck = await LoadTruck.findByPk(id);
  if (!loadTruck) return next(new ErrorHandler("LoadTruck not found", 404));

  const truck = await Truck.findByPk(truckId);
  if (!truck) return next(new ErrorHandler("Truck not found", 404));

  await loadTruck.update({
    date,
    truckId,
    from,
    to,
    addEditBy: req.user.userId,
  });

  const updated = await LoadTruck.findByPk(id, {
    include: [
      { model: User, attributes: ["fullName", "email"] },
      { model: Truck },
    ],
  });

  const loadTruckData = allLoadsDto(updated.get({ plain: true }));

  return SuccessMessage(res, "LoadTruck updated successfully", {
    loadTruckData,
  });
});

export const deleteLoadTruck = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const loadTruck = await LoadTruck.findByPk(id);
  if (!loadTruck) return next(new ErrorHandler("LoadTruck not found", 404));

  await loadTruck.destroy(); // soft delete
  return SuccessMessage(res, "LoadTruck deleted successfully");
});
