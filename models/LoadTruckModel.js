import { DataTypes, Model } from "sequelize";
import { sequelizeInstance } from "../config/dbConnect.js";
import Truck from "./TruckModel.js";
import User from "./UserModel.js";
import { PAYMENT_OPTIONS } from "../config/Constants.js";

class LoadTruck extends Model {}

LoadTruck.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATEONLY,
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
    tripMoney: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    invoice: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payment: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_OPTIONS)),
      allowNull: true,
      defaultValue: PAYMENT_OPTIONS.cach,
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
