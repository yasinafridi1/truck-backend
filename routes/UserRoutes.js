import express from "express";
import auth from "../middlewares/Auth.js";
import validateBody from "../middlewares/Validator.js";
import { signupSchema } from "../validations/index.js";
import {
  addUser,
  deleteUser,
  getAllUsers,
  getPrintData,
  getUserDetail,
  updateUser,
} from "../controllers/UserController.js";

const router = express.Router();

router
  .route("/")
  .get(auth, getAllUsers)
  .post([auth, validateBody(signupSchema)], addUser);

router.route("/print_data").get(auth, getPrintData);

router
  .route("/:userId")
  .get(auth, getUserDetail)
  .patch(auth, updateUser)
  .delete(auth, deleteUser);

export default router;
