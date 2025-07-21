import { DataTypes, Model } from "sequelize";
import { sequelizeInstance } from "../config/dbConnect.js";

class User extends Model {}

User.init(
  {
    userId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [3, 100] },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("SUPER_ADMIN", "ADMIN_MANAGER"),
      allowNull: false,
    },
    passwordRetries: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lockUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    accessToken: { type: DataTypes.TEXT, allowNull: true },
    refreshToken: { type: DataTypes.TEXT, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize: sequelizeInstance,
    modelName: "Users",
    freezeTableName: true,
    paranoid: true, // enables soft delete
    timestamps: true, // make sure timestamps are enabled
  }
);

export default User;
