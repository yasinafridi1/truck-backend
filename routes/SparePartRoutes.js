import express from "express";
import auth from "../middlewares/Auth.js";
import validateBody from "../middlewares/Validator.js";
import { addUpdateSparePartSchema } from "../validations/index.js";
import {
  createSparePart,
  deleteSparePart,
  getAllSpareParts,
  getPrintData,
  getSparePartDetail,
  getSparepartOptions,
  updateSparePart,
} from "../controllers/SparePartController.js";
import { upload } from "../services/multerService.js";
const router = express.Router();

router
  .route("/")
  .get(auth, getAllSpareParts)
  .post(
    [auth, upload.single("file"), validateBody(addUpdateSparePartSchema)],
    createSparePart
  );

router.route("/spare_parts_options").get(auth, getSparepartOptions);
router.route("/print_data").get(auth, getPrintData);

router
  .route("/:id")
  .get(auth, getSparePartDetail)
  .patch(
    [auth, upload.single("file"), validateBody(addUpdateSparePartSchema)],
    updateSparePart
  )
  .delete(auth, deleteSparePart);

export default router;
