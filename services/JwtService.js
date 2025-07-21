import jwt from "jsonwebtoken";
import envVariables from "../config/Constants.js";
import User from "../models/UserModel.js";

const { accessTokenSecret, refreshTokenSecret } = envVariables;

export const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, accessTokenSecret, {
    expiresIn: "24h",
  });
  const refreshToken = jwt.sign(payload, refreshTokenSecret, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
};

export const storeTokens = async (accessToken, refreshToken, userId) => {
  return await User.update(
    { accessToken: accessToken, refreshToken: refreshToken },
    { where: { userId } }
  );
};

export const verifyAccessToken = async (token) => {
  try {
    const decodedToken = jwt.verify(token, accessTokenSecret);
    const userData = await User.findOne({
      where: { userId: decodedToken.userId, accessToken: token },
    });
    if (!userData) {
      const error = new Error("user_not_found");
      error.statusCode = 401; // Set custom status code for invalid token
      throw error;
    }

    return userData;
  } catch (error) {
    if (error?.message === "user_not_found") {
      error.message = "Invalide token";
    } else {
      error.message = "Token expired";
    }
    throw error;
  }
};

export const verifyRefreshToken = async (token) => {
  try {
    const decodedToken = jwt.verify(token, refreshTokenSecret);
    return decodedToken;
  } catch (error) {
    error.statusCode = 401; // Set custom status code for token verification errors
    error.message = "Token expired";
    throw error;
  }
};
