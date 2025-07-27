import { col, fn, Op, where } from "sequelize";
import User from "../models/UserModel.js";
import { userDTO } from "../services/Dtos.js";
import AsyncWrapper from "../utils/AsyncWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import SuccessMessage from "../utils/SuccessMessage.js";
import bcrypt from "bcrypt";

export const addUser = AsyncWrapper(async (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") {
    return next(
      new ErrorHandler("You don't have permission to add manager", 403)
    );
  }
  const { fullName, email, password, status, phone } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return next(new ErrorHandler("User already exists", 409));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Sequelize create a new user
  const user = await User.create({
    fullName,
    email,
    status,
    phone,
    password: hashedPassword,
    role: "ADMIN_MANAGER",
  });

  if (!user) {
    return next(new ErrorHandler("Failed to register user", 500));
  }

  return SuccessMessage(res, "Manager added successfully", {
    userData: userDTO(user),
  });
});

export const deleteUser = AsyncWrapper(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findByPk(userId);
  if (!user) return next(new ErrorHandler("User not found", 404));

  await user.destroy();

  return SuccessMessage(res, "User deleted successfully");
});

export const updateUser = AsyncWrapper(async (req, res, next) => {
  const { userId } = req.params;
  const { fullName, email, phone, status } = req.body;

  const user = await User.findByPk(userId);
  if (!user) return next(new ErrorHandler("User not found", 404));

  user.fullName = fullName || user.fullName;
  user.email = email || user.email;
  user.phone = phone || user.phone;
  user.status = status || user.status;

  await user.save();

  return SuccessMessage(res, "User updated successfully", {
    userData: userDTO(user),
  });
});

export const getAllUsers = AsyncWrapper(async (req, res, next) => {
  const { search = "", page = 1, perPage = 10, status } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(perPage);
  const limit = parseInt(perPage);

  const whereClause = {
    [Op.or]: [
      where(fn("LOWER", col("fullName")), {
        [Op.like]: `%${search.toLowerCase()}%`,
      }),
      where(fn("LOWER", col("email")), {
        [Op.like]: `%${search.toLowerCase()}%`,
      }),
      where(fn("LOWER", col("phone")), {
        [Op.like]: `%${search.toLowerCase()}%`,
      }),
    ],
  };
  whereClause.role = { [Op.ne]: "SUPER_ADMIN" };

  // Add status filter if provided
  if (status) {
    const statusArray = Array.isArray(status) ? status : [status];
    whereClause.status = { [Op.in]: statusArray };
  }

  const { rows: users, count } = await User.findAndCountAll({
    where: whereClause,
    offset,
    limit,
    order: [["createdAt", "DESC"]],
  });

  const totalPages = Math.ceil(count / limit);

  return SuccessMessage(res, "Users fetched successfully", {
    users: users.map(userDTO),
    totalRecords: count,
    currentPage: parseInt(page),
    perPage: parseInt(perPage),
    totalPages,
  });
});

export const getUserDetail = AsyncWrapper(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findOne({ where: { userId } });
  if (!user) return next(new ErrorHandler("User not found", 404));

  return SuccessMessage(res, "User details fetched successfully", {
    userData: userDTO(user),
  });
});
