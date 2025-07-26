import { DataTypes, Model } from "sequelize";
import { sequelizeInstance } from "../config/dbConnect.js";
import Truck from "./TruckModel.js";
import SparePart from "./SparePartModel.js";
import User from "./UserModel.js";

class UsedPart extends Model {}

UsedPart.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    partId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: SparePart,
        key: "id",
      },
    },
    truckId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: Truck,
        key: "id",
      },
    },
    quantityUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    modelName: "UsedPart",
    freezeTableName: true, //mean not add the s pluralize with table
    paranoid: true, // enables soft delete
    timestamps: true, // make sure timestamps are enabled
  }
);

User.hasMany(UsedPart, { foreignKey: "addEditBy" });
UsedPart.belongsTo(User, { foreignKey: "addEditBy" });

Truck.hasMany(UsedPart, { foreignKey: "truckId" });
UsedPart.belongsTo(Truck, { foreignKey: "truckId" });

SparePart.hasMany(UsedPart, { foreignKey: "partId" });
UsedPart.belongsTo(SparePart, { foreignKey: "partId" });

export default UsedPart;
