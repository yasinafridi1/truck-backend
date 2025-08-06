import LoadTruck from "../models/LoadTruckModel.js";
import SparePart from "../models/SparePartModel.js";
import Truck from "../models/TruckModel.js";
import UsedPart from "../models/UsedParts.js";
import User from "../models/UserModel.js";

const dbInit = () => {
  // User.sync({ alter: true });
  // Truck.sync({ alter: true, force: true });
  // SparePart.sync({ alter: true });
  // UsedPart.sync({ alter: true });
  // LoadTruck.sync({ alter: true });
};

export default dbInit;
