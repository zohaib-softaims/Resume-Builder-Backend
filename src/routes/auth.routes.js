import express from "express";
import { signup } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validator.js";
import { signupSchema } from "../validators/auth.validators.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), signup);

export default router;
