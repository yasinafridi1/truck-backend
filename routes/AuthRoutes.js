import express from "express";
import auth from "../middlewares/Auth.js";
import validateBody from "../middlewares/Validator.js";
import { loginSchema, signupSchema } from "../validations/index.js";
import {
  addManager,
  login,
  logout,
  register,
} from "../controllers/AuthController.js";

const router = express.Router();

router.post("/login", validateBody(loginSchema), login);
router.post("/register", validateBody(signupSchema), register);
router.post("/add_manager", [auth, validateBody(signupSchema)], addManager);
router.get("/logout", auth, logout);

export default router;
