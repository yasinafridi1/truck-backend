import express from "express";
import auth from "../middlewares/Auth.js";
import validateBody from "../middlewares/Validator.js";
import {
  addTruck,
  deleteTruck,
  getAllTrucks,
  getPrintData,
  getTruckDetail,
  getTruckOptions,
  updateTruck,
} from "../controllers/truckController.js";
import { addUpdateTruckSchema } from "../validations/index.js";
const router = express.Router();

router
  .route("/")
  .get(auth, getAllTrucks)
  .post([auth, validateBody(addUpdateTruckSchema)], addTruck);

router.route("/truck_options").get(auth, getTruckOptions);
router.route("/print_data").get(auth, getPrintData);

router
  .route("/:truckId")
  .get(auth, getTruckDetail)
  .patch([auth, validateBody(addUpdateTruckSchema)], updateTruck)
  .delete(auth, deleteTruck);

export default router;
