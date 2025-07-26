import express from "express";
import auth from "../middlewares/Auth.js";
import validateBody from "../middlewares/Validator.js";
import { addUpdateSparePartSchema } from "../validations/index.js";
import {
  createSparePart,
  deleteSparePart,
  getAllSpareParts,
  getSparePartDetail,
  updateSparePart,
} from "../controllers/SparePartController.js";
const router = express.Router();

router
  .route("/")
  .get(auth, getAllSpareParts)
  .post([auth, validateBody(addUpdateSparePartSchema)], createSparePart);

router
  .route("/:id")
  .get(auth, getSparePartDetail)
  .patch([auth, validateBody(addUpdateSparePartSchema)], updateSparePart)
  .delete(auth, deleteSparePart);

export default router;
