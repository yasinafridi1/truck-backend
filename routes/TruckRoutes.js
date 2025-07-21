import express from "express";
import auth from "../middlewares/Auth.js";
import validateBody from "../middlewares/Validator.js";
import { addTruck, getAllTrucks } from "../controllers/truckController.js";
import { addUpdateTruckSchema } from "../validations/index.js";
const router = express.Router();

router
  .route("/")
  .get(auth, getAllTrucks)
  .post([auth, validateBody(addUpdateTruckSchema)], addTruck);

export default router;
