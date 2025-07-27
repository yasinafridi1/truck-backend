import { DataTypes, Model } from "sequelize";
import { sequelizeInstance } from "../config/dbConnect.js";
import Truck from "./TruckModel.js";
import User from "./UserModel.js";

class LoadTruck extends Model {}

LoadTruck.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    truckId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: Truck,
        key: "id",
      },
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("from", value.toLowerCase());
      },
    },
    to: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("to", value.toLowerCase());
      },
    },
    addEditBy: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: User,
        key: "userId",
      },
    },
  },
  {
    sequelize: sequelizeInstance,
    modelName: "LoadTrucks",
    freezeTableName: true, //mean not add the s pluralize with table
    paranoid: true, // enables soft delete
    timestamps: true, // make sure timestamps are enabled
  }
);

User.hasMany(LoadTruck, { foreignKey: "addEditBy" });
LoadTruck.belongsTo(User, { foreignKey: "addEditBy" });

Truck.hasMany(LoadTruck, { foreignKey: "truckId" });
LoadTruck.belongsTo(Truck, { foreignKey: "truckId" });

export default LoadTruck;
