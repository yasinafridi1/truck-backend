import AsyncWrapper from "../utils/AsyncWrapper.js";
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
    addEditBy: req.user.userId,
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
        attributes: ["id", "numberPlate", "chesosNumber", "driverName"],
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
  const { page = 1, perPage = 10, truck, spare_part } = req.query;
  const offset = (page - 1) * perPage;
  const where = {};

  if (truck) {
    const truckIds = Array.isArray(truck) ? truck : [truck];
    where.truckId = {
      [Op.in]: truckIds,
    };
  }

  // Handle spare_part filter
  if (spare_part) {
    const sparePartIds = Array.isArray(spare_part) ? spare_part : [spare_part];
    where.partId = {
      [Op.in]: sparePartIds,
    };
  }

  const { rows, count } = await UsedPart.findAndCountAll({
    where,
    limit: parseInt(perPage),
    offset: parseInt(offset),
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        attributes: ["fullName", "email"],
      },
      {
        model: Truck,
        attributes: ["id", "numberPlate", "chesosNumber", "driverName"],
      },
      {
        model: SparePart,
        attributes: ["id", "name", "price"],
      },
    ],
  });

  const usedPartsData = rows.map((usedPart) =>
    allUsedPartDto(usedPart.get({ plain: true }))
  );

  return SuccessMessage(res, "Used parts fetched successfully", {
    usedPartsData,
    currentPage: parseInt(page),
    totalPages: Math.ceil(count / perPage),
    totalRecords: count,
    perPage: parseInt(perPage),
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
        attributes: ["id", "numberPlate", "chesosNumber", "driverName"],
      },
      {
        model: SparePart,
        attributes: ["id", "name", "price"],
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

  const isQuantityChanged = oldQuantityUsed !== quantityUsed;
  const isPartChanged = oldPartId !== partId;

  if (isPartChanged) {
    // Part has changed — restore old part quantity and deduct from new one
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
  } else if (isQuantityChanged) {
    // Part is the same, but quantity used has changed
    const totalAvailable = newPart.quantity + oldQuantityUsed;

    if (totalAvailable < quantityUsed) {
      return next(new ErrorHandler("Insufficient quantity of spare part", 400));
    }

    const diff = quantityUsed - oldQuantityUsed;

    if (diff > 0) {
      // Quantity increased — reduce stock
      await newPart.update({
        quantity: newPart.quantity - diff,
      });
    } else if (diff < 0) {
      // Quantity decreased — add back to stock
      await newPart.update({
        quantity: newPart.quantity + Math.abs(diff),
      });
    }
  }

  // 4. Update the used part record
  await usedPart.update({
    partId,
    truckId,
    quantityUsed,
    addEditBy: req.user?.userId || null,
  });

  // 5. Fetch updated record with associations
  const updatedUsedPart = await UsedPart.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ["fullName", "email"],
      },
      {
        model: Truck,
        attributes: ["id", "numberPlate", "chesosNumber", "driverName"],
      },
      {
        model: SparePart,
        attributes: ["id", "name", "price"],
      },
    ],
  });

  const usedPartData = allUsedPartDto(updatedUsedPart.get({ plain: true }));

  return SuccessMessage(res, "Used part updated successfully", {
    usedPartData,
  });
});

export const getPrintData = AsyncWrapper(async (req, res, next) => {
  const data = await UsedPart.findAll({
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        attributes: ["fullName", "email"],
      },
      {
        model: Truck,
        attributes: ["id", "numberPlate", "chesosNumber"],
      },
      {
        model: SparePart,
        attributes: ["id", "name", "price"],
      },
    ],
  });

  const usedPartsData = rows.map((usedPart) =>
    allUsedPartDto(usedPart.get({ plain: true }))
  );

  return SuccessMessage(res, "All data fetched successfully", usedPartsData);
});
