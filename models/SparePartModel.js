import { DataTypes, Model } from "sequelize";
import { sequelizeInstance } from "../config/dbConnect.js";
import User from "./UserModel.js";

class SparePart extends Model {}

SparePart.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("name", value.toLowerCase());
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    invoice: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    addEditBy: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: User,
        key: "userId", // assuming `userId` is the PK in User model
      },
    },
  },
  {
    sequelize: sequelizeInstance,
    modelName: "SparePart",
    freezeTableName: true, //mean not add the s pluralize with table
    paranoid: true, // enables soft delete
    timestamps: true, // make sure timestamps are enabled
  }
);

User.hasMany(SparePart, { foreignKey: "addEditBy" });
SparePart.belongsTo(User, { foreignKey: "addEditBy" });

export default SparePart;
