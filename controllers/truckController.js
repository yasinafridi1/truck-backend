import Truck from "../models/TruckModel.js";
import User from "../models/UserModel.js";
import { allTruckDto, truckDetailDto } from "../services/Dtos.js";
import AsyncWrapper from "../utils/AsyncWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import SuccessMessage from "../utils/SuccessMessage.js";
import { Op } from "sequelize";
import { deleteCache, getCache, setCache } from "../utils/cacheUtil.js";

export const getAllTrucks = AsyncWrapper(async (req, res, next) => {
  const { page = 1, perPage = 10, search = "", startDate, endDate } = req.query;

  const offset = (page - 1) * perPage;

  // Build WHERE conditions
  const whereConditions = {};

  if (search) {
    whereConditions[Op.or] = [
      {
        numberPlate: {
          [Op.like]: `%${search}%`,
        },
      },
      {
        chesosNumber: {
          [Op.like]: `%${search}%`,
        },
      },
    ];
  }

  if (startDate) {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    whereConditions.createdAt = {
      [Op.between]: [start, end],
    };
  }

  // 🚚 Fetch paginated + filtered data
  const { rows: trucks, count: total } = await Truck.findAndCountAll({
    where: whereConditions,
    include: [
      {
        model: User,
        attributes: ["fullName", "email"],
      },
    ],
    perPage: parseInt(perPage),
    offset: parseInt(offset),
    order: [["createdAt", "DESC"]],
  });

  let truckData = [];
  if (trucks.length > 0) {
    truckData = trucks.map((truck) => allTruckDto(truck.get({ plain: true })));
  }

  return SuccessMessage(res, "Trucks fetched successfully", {
    truckData,
    currentPage: parseInt(page),
    perPage: parseInt(perPage),
    totalPages: Math.ceil(total / perPage),
    totalRecords: total,
  });
});

export const addTruck = AsyncWrapper(async (req, res, next) => {
  const { numberPlate, chesosNumber } = req.body;

  const existingTruck = await Truck.findOne({
    where: { numberPlate: numberPlate.toLowerCase() },
  });
  if (existingTruck) {
    return next(new ErrorHandler("Number plate already exists", 400));
  }

  const newTruck = await Truck.create({
    numberPlate,
    chesosNumber,
    addEditBy: req.user.userId, // assuming req.user is populated with user info
  });

  const truckWithUser = await Truck.findOne({
    where: { id: newTruck.id },
    include: [
      {
        model: User,
        attributes: ["fullName", "email"],
      },
    ],
  });
  const plainData = truckWithUser.get({ plain: true });
  deleteCache("truck_options");
  const truckData = allTruckDto(plainData);
  return SuccessMessage(res, "Truck added successfully", { truckData });
});

export const updateTruck = AsyncWrapper(async (req, res, next) => {
  const { truckId } = req.params;
  const { numberPlate, chesosNumber } = req.body;

  const truck = await Truck.findByPk(truckId);
  if (!truck) {
    return next(new ErrorHandler("Truck not found", 404));
  }

  // 🔍 Check if another truck already has the same numberPlate
  const existingTruck = await Truck.findOne({
    where: {
      numberPlate: numberPlate.toLowerCase(),
      id: { [Op.ne]: truckId }, // Not the current truck
    },
  });

  if (existingTruck) {
    return next(new ErrorHandler("Number plate already exists", 400));
  }

  await truck.update({
    numberPlate,
    chesosNumber,
    addEditBy: req.user.userId,
  });

  const updatedTruck = await Truck.findByPk(truckId, {
    include: [
      {
        model: User,
        attributes: ["fullName", "email"],
      },
    ],
  });
  deleteCache("truck_options");
  const truckData = allTruckDto(updatedTruck.get({ plain: true }));
  return SuccessMessage(res, "Truck updated successfully", { truckData });
});

export const deleteTruck = AsyncWrapper(async (req, res, next) => {
  const { truckId } = req.params;

  const truck = await Truck.findByPk(truckId);
  if (!truck) {
    return next(new ErrorHandler("Truck not found", 404));
  }

  await truck.destroy(); // Soft delete due to paranoid: true
  deleteCache("truck_options");
  return SuccessMessage(res, "Truck deleted successfully");
});

export const getTruckDetail = AsyncWrapper(async (req, res, next) => {
  const { truckId } = req.params;
  const truck = await Truck.findByPk(truckId, {
    include: [
      {
        model: User,
        attributes: ["fullName", "email"],
      },
    ],
  });
  if (!truck) {
    return next(new ErrorHandler("Truck not found", 404));
  }

  const truckData = truckDetailDto(truck);
  return SuccessMessage(res, "Truck details fetched successfully", {
    truckData,
  });
});

export const getTruckOptions = AsyncWrapper(async (req, res, next) => {
  // ✅ Check if data is already cached
  const cachedOptions = getCache("truck_options");
  if (cachedOptions) {
    return SuccessMessage(res, "Truck options fetched from cache", {
      truckOptions: cachedOptions,
    });
  }

  // ❌ Not cached, fetch from DB
  const trucks = await Truck.findAll({
    attributes: ["id", "numberPlate"],
    order: [["numberPlate", "ASC"]],
  });

  const truckOptions = trucks.map((truck) => ({
    id: truck.id,
    numberPlate: truck.numberPlate,
  }));

  // ✅ Cache it for future requests
  setCache("truck_options", truckOptions);

  return SuccessMessage(res, "Truck options fetched successfully", {
    truckOptions,
  });
});
