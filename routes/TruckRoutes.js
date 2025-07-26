import express from "express";
import auth from "../middlewares/Auth.js";
import validateBody from "../middlewares/Validator.js";
import {
  addTruck,
  deleteTruck,
  getAllTrucks,
  getTruckDetail,
  updateTruck,
} from "../controllers/truckController.js";
import { addUpdateTruckSchema } from "../validations/index.js";
const router = express.Router();

router
  .route("/")
  .get(auth, getAllTrucks)
  .post([auth, validateBody(addUpdateTruckSchema)], addTruck);

router
  .route("/:truckId")
  .get(auth, getTruckDetail)
  .patch([auth, validateBody(addUpdateTruckSchema)], updateTruck)
  .delete(auth, deleteTruck);

export default router;
