import { DataTypes, Model } from "sequelize";
import { sequelizeInstance } from "../config/dbConnect.js";
import User from "./UserModel.js";

class Truck extends Model {}

Truck.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    chesosNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numberPlate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addEditBy: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: User,
        key: "userId", // or 'userId', depending on your User model
      },
    },
  },
  {
    sequelize: sequelizeInstance,
    modelName: "Truck",
    freezeTableName: true, //mean not add the s pluralize with table
    paranoid: true, // enables soft delete
    timestamps: true, // make sure timestamps are enabled
  }
);

User.hasMany(Truck, { foreignKey: "addEditBy" });
Truck.belongsTo(User, { foreignKey: "addEditBy" });

export default Truck;
