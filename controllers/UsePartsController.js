import AsyncWrapper from "../utils/AsyncWrapper";
import ErrorHandler from "../utils/ErrorHandler.js";
import SuccessMessage from "../utils/SuccessMessage.js";
import User from "../models/UserModel.js";
import SparePart from "../models/SparePartModel.js";
import Truck from "../models/TruckModel.js";
import UsedPart from "../models/UsedParts.js";
import { allUsedPartDto, usedPartDetailDto } from "../services/Dtos.js";
import { Op } from "sequelize";

export const usePart = AsyncWrapper(async (req, res, next) => {
  const { partId, truckId, quantityUsed } = req.body;

  const isPartExist = await SparePart.findOne({ where: { id: partId } });
  if (!isPartExist) {
    return next(new ErrorHandler("Spare part not found", 404));
  }

  if (isPartExist.quantity < quantityUsed) {
    return next(new ErrorHandler("Insufficient quantity of spare part", 400));
  }

  const truck = await Truck.findByPk(truckId);
  if (!truck) {
    return next(new ErrorHandler("Truck not found", 404));
  }

  // Create a new used part entry
  const usedPart = await UsedPart.create({
    partId,
    truckId,
    quantityUsed,
    usedBy: req.user.userId,
  });

  // Update the spare part quantity
  await isPartExist.update({
    quantity: isPartExist.quantity - quantityUsed,
  });
  const usedPartWithDetail = await UsedPart.findOne({
    where: { id: usedPart.id },
    include: [
      {
        model: User,
        attributes: ["fullName", "email"],
      },
      {
        model: Truck,
        attributes: ["numberPlate", "chesosNumber"],
      },
      {
        model: SparePart,
        attributes: ["name", "price"],
      },
    ],
  });

  const usedPartData = allUsedPartDto(usedPartWithDetail.get({ plain: true }));
  return SuccessMessage(res, "Parts used successfully", { usedPartData });
});

export const getAllUsedParts = AsyncWrapper(async (req, res, next) => {
  const { page = 1, limit = 10, search = "", startDate, endDate } = req.query;
  const offset = (page - 1) * limit;
  const where = {};
  if (search) {
    where.truckId = {
      [Op.like]: `%${search}%`,
    };
  }

  if (startDate) {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    where.createdAt = {
      [Op.between]: [start, end],
    };
  }

  const { rows, count } = await UsedPart.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        attributes: ["fullName", "email"],
      },
      {
        model: Truck,
        attributes: ["numberPlate", "chesosNumber"],
      },
      {
        model: SparePart,
        attributes: ["name", "price"],
      },
    ],
  });

  const usedPartsData = rows.map((usedPart) =>
    allUsedPartDto(usedPart.get({ plain: true }))
  );

  return SuccessMessage(res, "Used parts fetched successfully", {
    usedPartsData,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
    totalRecords: count,
    limit: parseInt(limit),
  });
});

export const getUsedPartDetail = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const usedPart = await UsedPart.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ["fullName", "email"],
      },
      {
        model: Truck,
        attributes: ["numberPlate", "chesosNumber"],
      },
      {
        model: SparePart,
        attributes: ["name", "price"],
      },
    ],
  });

  if (!usedPart) {
    return next(new ErrorHandler("Used part not found", 404));
  }

  const usedPartData = usedPartDetailDto(usedPart.get({ plain: true }));
  return SuccessMessage(res, "Used part detail fetched successfully", {
    usedPartData,
  });
});

export const updateUsedPartDetail = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { partId, truckId, quantityUsed } = req.body;

  // 1. Fetch existing used part
  const usedPart = await UsedPart.findByPk(id);
  if (!usedPart) {
    return next(new ErrorHandler("Used part not found", 404));
  }

  const oldPartId = usedPart.partId;
  const oldQuantityUsed = usedPart.quantityUsed;

  // 2. Get new spare part
  const newPart = await SparePart.findByPk(partId);
  if (!newPart) {
    return next(new ErrorHandler("Spare part not found", 404));
  }

  // 3. Get truck
  const truck = await Truck.findByPk(truckId);
  if (!truck) {
    return next(new ErrorHandler("Truck not found", 404));
  }

  if (oldPartId !== partId) {
    // Case: Part is changed
    const oldPart = await SparePart.findByPk(oldPartId);
    if (oldPart) {
      await oldPart.update({
        quantity: oldPart.quantity + oldQuantityUsed,
      });
    }

    if (newPart.quantity < quantityUsed) {
      return next(
        new ErrorHandler("Insufficient quantity of new spare part", 400)
      );
    }

    await newPart.update({
      quantity: newPart.quantity - quantityUsed,
    });
  } else {
    // Case: Same part, adjust quantity based on difference
    const totalAvailable = newPart.quantity + oldQuantityUsed;

    if (totalAvailable < quantityUsed) {
      return next(new ErrorHandler("Insufficient quantity of spare part", 400));
    }

    const diff = quantityUsed - oldQuantityUsed;

    if (diff > 0) {
      // Decrease
      await newPart.update({
        quantity: newPart.quantity - diff,
      });
    } else if (diff < 0) {
      // Increase
      await newPart.update({
        quantity: newPart.quantity + Math.abs(diff),
      });
    }
    // If diff === 0, no change needed
  }

  // 4. Update used part
  await usedPart.update({
    partId,
    truckId,
    quantityUsed,
    addEditBy: req.user.userId,
  });

  // 5. Fetch updated data with associations
  const updatedUsedPart = await UsedPart.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ["fullName", "email"],
      },
      {
        model: Truck,
        attributes: ["numberPlate", "chesosNumber"],
      },
      {
        model: SparePart,
        attributes: ["name", "price"],
      },
    ],
  });

  const usedPartData = allUsedPartDto(updatedUsedPart.get({ plain: true }));

  return SuccessMessage(res, "Used part updated successfully", {
    usedPartData,
  });
});
