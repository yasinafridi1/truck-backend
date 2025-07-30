import express from "express";
import auth from "../middlewares/Auth.js";
import validateBody from "../middlewares/Validator.js";
import { addEditLoadSchema } from "../validations/index.js";
import {
  createLoadTruck,
  deleteLoadTruck,
  getAllLoadTrucks,
  getLoadTruckDetail,
  getPrintData,
  updateLoadTruck,
} from "../controllers/LoadController.js";
import { upload } from "../services/multerService.js";
const router = express.Router();

router
  .route("/")
  .get(auth, getAllLoadTrucks)
  .post(
    [auth, upload.single("file"), validateBody(addEditLoadSchema)],
    createLoadTruck
  );

router.route("/print_data").get(auth, getPrintData);

router
  .route("/:id")
  .get(auth, getLoadTruckDetail)
  .patch(
    [auth, upload.single("file"), validateBody(addEditLoadSchema)],
    updateLoadTruck
  )
  .delete(auth, deleteLoadTruck);

export default router;
