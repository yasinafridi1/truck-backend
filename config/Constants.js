import dotenv from "dotenv";
dotenv.config();
const envVariables = {
  appPort: process.env.PORT || 8000,
  dbUserName: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  dbHostName: process.env.DB_HOSTNAME,
  dbName: process.env.DB_NAME,
  dbPort: process.env.DB_PORT,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  smtpUserName: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  maxPasswordAttempts: process.env.MAX_PASSWORD_ATTEMPTS || 5,
};

export const USER_STATUS = {
  active: "ACTIVE",
  blocked: "BLOCKED",
  pending: "PENDING",
};

export const PAYMENT_OPTIONS = {
  cash: "CASH",
  credit: "CREDIT",
};

export default envVariables;
