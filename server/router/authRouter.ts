import express from "express";

import * as authController from "../controllers/auth";
import { validation } from "../middlewares";
import { joiUserSchema } from "../models/User";

export const authRouter = express.Router();

authRouter.post("/auth", validation(joiUserSchema), authController.auth);
