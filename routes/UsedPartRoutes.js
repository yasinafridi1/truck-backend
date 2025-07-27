import express from "express";
import auth from "../middlewares/Auth.js";
import validateBody from "../middlewares/Validator.js";
import {
  getAllUsedParts,
  getUsedPartDetail,
  updateUsedPartDetail,
  usePart,
} from "../controllers/UsePartsController.js";
import { addUpdateUsedPartSchema } from "../validations/index.js";
const router = express.Router();

router
  .route("/")
  .get(auth, getAllUsedParts)
  .post([auth, validateBody(addUpdateUsedPartSchema)], usePart);
router
  .route("/:id")
  .get(auth, getUsedPartDetail)
  .patch([auth, validateBody(addUpdateUsedPartSchema)], updateUsedPartDetail);

export default router;
