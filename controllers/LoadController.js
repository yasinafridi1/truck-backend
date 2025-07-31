import LoadTruck from "../models/LoadTruckModel.js";
import Truck from "../models/TruckModel.js";
import User from "../models/UserModel.js";
import { allLoadsDto, loadTruckDetailDto } from "../services/Dtos.js";
import AsyncWrapper from "../utils/AsyncWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { deleteFile } from "../utils/fileHandler.js";
import SuccessMessage from "../utils/SuccessMessage.js";
import { Op } from "sequelize";

export const createLoadTruck = AsyncWrapper(async (req, res, next) => {
  const {
    date,
    truckId,
    amount,
    from,
    to,
    payment,
    tripMoney,
    driverIqamaNumber,
  } = req.body;

  const truck = await Truck.findByPk(truckId);
  if (!truck) return next(new ErrorHandler("Truck not found", 404));

  const newLoadTruck = await LoadTruck.create({
    date,
    truckId,
    from,
    amount,
    to,
    payment,
    tripMoney,
    driverIqamaNumber,
    invoice: req?.file?.filename || null,
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
  const {
    page = 1,
    perPage = 10,
    from = "",
    to = "",
    truck,
    startDate,
    endDate,
  } = req.query;
  const offset = (page - 1) * perPage;

  const where = {};

  if (from) {
    where.from = { [Op.like]: `%${from}%` };
  }
  if (to) {
    where.to = { [Op.like]: `%${to}%` };
  }

  if (truck) {
    const truckArray = Array.isArray(truck) ? truck : [truck];
    where.truckId = { [Op.in]: truckArray };
  }

  if (startDate) {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    where.date = {
      [Op.between]: [start, end],
    };
  }

  const { rows, count } = await LoadTruck.findAndCountAll({
    where,
    limit: parseInt(perPage),
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
    currentPage: parseInt(page),
    perPage: parseInt(perPage),
    totalRecords: count,
    totalPages: Math.ceil(count / perPage),
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
  const {
    date,
    truckId,
    amount,
    from,
    to,
    payment,
    fileRemoved,
    tripMoney,
    driverIqamaNumber,
  } = req.body;

  const loadTruck = await LoadTruck.findByPk(id);
  if (!loadTruck) return next(new ErrorHandler("LoadTruck not found", 404));

  const truck = await Truck.findByPk(truckId);
  if (!truck) return next(new ErrorHandler("Truck not found", 404));

  if ((req?.file?.filename || fileRemoved) && loadTruck?.invoice) {
    deleteFile(loadTruck?.invoice);
  }

  await loadTruck.update({
    date,
    truckId,
    from,
    to,
    amount,
    payment,
    tripMoney,
    driverIqamaNumber,
    invoice: req?.file
      ? req.file?.filename
      : fileRemoved
      ? null
      : loadTruck?.invoice,
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

  if (loadTruck?.invoice) {
    deleteFile(loadTruck?.invoice);
  }

  await loadTruck.destroy(); // soft delete
  return SuccessMessage(res, "LoadTruck deleted successfully");
});

export const getPrintData = AsyncWrapper(async (req, res, next) => {
  const data = await LoadTruck.findAll({
    order: [["createdAt", "DESC"]],
    include: [
      { model: User, attributes: ["fullName", "email"] },
      { model: Truck },
    ],
  });

  const loadData = data.map((loadTruck) =>
    allLoadsDto(loadTruck.get({ plain: true }))
  );

  return SuccessMessage(res, "All data fetched successfully", loadData);
});
