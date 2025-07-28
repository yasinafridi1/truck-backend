import envVariables, { USER_STATUS } from "../config/Constants.js";
import User from "../models/UserModel.js";
import { userDTO } from "../services/Dtos.js";
import {
  generateTokens,
  storeTokens,
  verifyRefreshToken,
} from "../services/JwtService.js";
import AsyncWrapper from "../utils/AsyncWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import SuccessMessage from "../utils/SuccessMessage.js";
import bcrypt from "bcrypt";

export const login = AsyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  const admin = await User.findOne({ where: { email } });
  if (!admin) {
    return next(new ErrorHandler("Incorrect email or password", 403));
  }
  if (admin.lockUntil && admin.lockUntil > new Date()) {
    const unlockTime = admin.lockUntil.toLocaleString();
    return next(
      new ErrorHandler(`Account is locked. Try again after: ${unlockTime}`, 400)
    );
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    admin.passwordRetries += 1;

    // Lock account if tries reach 5
    if (admin.passwordRetries >= envVariables.maxPasswordAttempts) {
      admin.lockUntil = new Date(Date.now() + 10 * 60 * 60 * 1000);
    }

    admin.save();
    return next(new ErrorHandler("Incorrect email or password", 422));
  }

  admin.passwordRetries = 0;
  admin.lockUntil = null;
  await admin.save();
  if (admin.status === USER_STATUS.blocked) {
    return next(
      new ErrorHandler("Your account has been blocked by admin", 403)
    );
  }

  const { accessToken, refreshToken } = generateTokens({
    userId: admin.userId,
    role: admin.role,
  });

  await storeTokens(accessToken, refreshToken, admin.userId);

  const userData = userDTO(admin);
  return SuccessMessage(res, "Logged in successfully", {
    userData,
    accessToken,
    refreshToken,
  });
});

export const register = AsyncWrapper(async (req, res, next) => {
  let { fullName, email, password, status, phone } = req.body;

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
    role: "SUPER_ADMIN",
  });

  if (!user) {
    return next(new ErrorHandler("Failed to register user", 500));
  }

  return SuccessMessage(res, "Account created successfully");
});

export const logout = AsyncWrapper(async (req, res, next) => {
  const user = await User.findByPk(req.user.userId);
  if (!user) {
    return next("User not found", 404);
  }

  await User.update(
    { accessToken: "", refreshToken: "" },
    { where: { userId: req.user.userId } }
  );
  return SuccessMessage(res, "User logout successfully", null, 200);
});

export const autoLogin = AsyncWrapper(async (req, res, next) => {
  const { refreshToken: refreshTokenFromBody } = req.body;
  const user = await verifyRefreshToken(refreshTokenFromBody);
  const { accessToken, refreshToken } = generateTokens({
    userId: user.userId,
    role: user.role,
  });
  await storeTokens(accessToken, refreshToken, user.userId, user.role);
  const userData = userDTO(user);
  return SuccessMessage(res, "Session refresh successfully", {
    userData,
    accessToken,
    refreshToken,
  });
});
