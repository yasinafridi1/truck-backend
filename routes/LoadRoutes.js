import express from "express";
import auth from "../middlewares/Auth.js";
import validateBody from "../middlewares/Validator.js";
import { addEditLoadSchema } from "../validations/index.js";
import {
  createLoadTruck,
  deleteLoadTruck,
  getAllLoadTrucks,
  getLoadTruckDetail,
  updateLoadTruck,
} from "../controllers/LoadController.js";
const router = express.Router();

router
  .route("/")
  .get(auth, getAllLoadTrucks)
  .post([auth, validateBody(addEditLoadSchema)], createLoadTruck);
router
  .route("/:id")
  .get(auth, getLoadTruckDetail)
  .patch([auth, validateBody(addEditLoadSchema)], updateLoadTruck)
  .delete(auth, deleteLoadTruck);

export default router;
