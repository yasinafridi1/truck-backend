import AsyncWrapper from "../utils/AsyncWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import SuccessMessage from "../utils/SuccessMessage.js";
import User from "../models/UserModel.js";
import { Op } from "sequelize";
import SparePart from "../models/SparePartModel.js";
import { allSparePartDto, sparePartDetailDto } from "../services/Dtos.js";
import { deleteCache, getCache, setCache } from "../utils/cacheUtil.js";
import { deleteFile } from "../utils/fileHandler.js";

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
    invoice: req?.file?.filename || null,
    addEditBy: req.user.userId,
  });

  const sparePart = await SparePart.findByPk(newSparePart.id, {
    include: {
      model: User,
      attributes: ["fullName", "email"],
    },
  });

  const sparePartData = allSparePartDto(sparePart.get({ plain: true }));
  deleteCache("sparepart_options");
  return SuccessMessage(res, "Spare part created successfully", {
    sparePartData,
  });
});

export const getAllSpareParts = AsyncWrapper(async (req, res, next) => {
  const { page = 1, perPage = 10, search = "" } = req.query;
  const offset = (page - 1) * perPage;

  const where = {};
  if (search) {
    where.name = {
      [Op.like]: `%${search.toLowerCase()}%`,
    };
  }

  const { rows, count } = await SparePart.findAndCountAll({
    where,
    limit: parseInt(perPage),
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
    currentPage: parseInt(page),
    perPage: parseInt(perPage),
    totalRecords: count,
    totalPages: Math.ceil(count / perPage),
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
  const { name, quantity, price, fileRemoved } = req.body;

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

  if ((req?.file?.filename || fileRemoved) && sparePart?.invoice) {
    deleteFile(sparePart?.invoice);
  }

  await sparePart.update({
    name,
    quantity,
    price,
    invoice: req?.file
      ? req.file?.filename
      : fileRemoved
      ? null
      : sparePart?.invoice,
    addEditBy: req.user.userId,
  });

  const updated = await SparePart.findByPk(id, {
    include: {
      model: User,
      attributes: ["fullName", "email"],
    },
  });

  const sparePartData = allSparePartDto(updated.get({ plain: true }));
  deleteCache("sparepart_options");
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

  if (sparePart?.invoice) {
    deleteFile(sparePart?.invoice);
  }
  await sparePart.destroy(); // Soft delete due to paranoid: true
  deleteCache("sparepart_options");
  return SuccessMessage(res, "Spare part deleted successfully");
});

export const getSparepartOptions = AsyncWrapper(async (req, res, next) => {
  const cachedData = getCache("sparepart_options");
  if (cachedData) {
    return SuccessMessage(res, "Fetched from cache", {
      sparePartOptions: cachedData,
    });
  }

  const spareParts = await SparePart.findAll({
    where: { quantity: { [Op.gt]: 0 } },
    attributes: ["id", "name", "quantity"],
    order: [["name", "ASC"]],
  });

  const sparePartOptions = spareParts.map((sp) => ({
    id: sp.id,
    name: sp.name,
    quantity: sp.quantity,
  }));

  setCache("sparepart_options", sparePartOptions);
  return SuccessMessage(res, "Fetched from DB", { sparePartOptions });
});

export const getPrintData = AsyncWrapper(async (req, res, next) => {
  const data = await SparePart.findAll({
    order: [["createdAt", "DESC"]],
    include: {
      model: User,
      attributes: ["fullName", "email"],
    },
  });

  const sparePartsData = data.map((sparePart) => allSparePartDto(sparePart));

  return SuccessMessage(res, "All data fetched successfully", sparePartsData);
});
