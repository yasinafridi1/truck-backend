import AsyncWrapper from "../utils/AsyncWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import SuccessMessage from "../utils/SuccessMessage.js";
import User from "../models/UserModel.js";
import { Op } from "sequelize";
import SparePart from "../models/SparePartModel.js";
import { allSparePartDto, sparePartDetailDto } from "../services/Dtos.js";

export const createSparePart = AsyncWrapper(async (req, res, next) => {
  const { name, quantity, price } = req.body;

  const lowerCaseName = name.toLowerCase();

  const isExisting = await SparePart.findOne({
    where: { name: lowerCaseName },
  });

  if (isExisting) {
    return next(new ErrorHandler("Spare part already exists", 400));
  }

  const newSparePart = await SparePart.create({
    name,
    quantity,
    price,
    addEditBy: req.user.userId,
  });

  const sparePart = await SparePart.findByPk(newSparePart.id, {
    include: {
      model: User,
      attributes: ["fullName", "email"],
    },
  });

  const sparePartData = allSparePartDto(sparePart.get({ plain: true }));

  return SuccessMessage(res, "Spare part created successfully", {
    sparePartData,
  });
});

export const getAllSpareParts = AsyncWrapper(async (req, res, next) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) {
    where.name = {
      [Op.like]: `%${search.toLowerCase()}%`,
    };
  }

  const { rows, count } = await SparePart.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["createdAt", "DESC"]],
    include: {
      model: User,
      attributes: ["fullName", "email"],
    },
  });

  const sparePartsData = rows.map((sparePart) => allSparePartDto(sparePart));

  return SuccessMessage(res, "Spare parts fetched successfully", {
    spareParts: sparePartsData,
    page: parseInt(page),
    limit: parseInt(limit),
    totalRecords: count,
    totalPages: Math.ceil(count / limit),
  });
});

export const getSparePartDetail = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const sparePart = await SparePart.findByPk(id, {
    include: {
      model: User,
      attributes: ["fullName", "email"],
    },
  });

  if (!sparePart) {
    return next(new ErrorHandler("Spare part not found", 404));
  }

  const sparePartData = sparePartDetailDto(sparePart.get({ plain: true }));

  return SuccessMessage(res, "Spare part details fetched successfully", {
    sparePartData,
  });
});

export const updateSparePart = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { name, quantity, price } = req.body;

  const sparePart = await SparePart.findByPk(id);
  if (!sparePart) {
    return next(new ErrorHandler("Spare part not found", 404));
  }

  const lowerCaseName = name.toLowerCase();

  const isExisting = await SparePart.findOne({
    where: { name: lowerCaseName, id: { [Op.ne]: id } },
  });

  if (isExisting) {
    return next(new ErrorHandler("Spare part already exists", 400));
  }

  await sparePart.update({
    name,
    quantity,
    price,
    addEditBy: req.user.userId,
  });

  const updated = await SparePart.findByPk(id, {
    include: {
      model: User,
      attributes: ["fullName", "email"],
    },
  });

  const sparePartData = allSparePartDto(updated.get({ plain: true }));

  return SuccessMessage(res, "Spare part updated successfully", {
    sparePartData,
  });
});

export const deleteSparePart = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const sparePart = await SparePart.findByPk(id);
  if (!sparePart) {
    return next(new ErrorHandler("Spare part not found", 404));
  }

  await sparePart.destroy(); // Soft delete due to paranoid: true

  return SuccessMessage(res, "Spare part deleted successfully");
});
