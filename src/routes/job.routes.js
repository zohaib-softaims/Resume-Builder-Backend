import { Router } from "express";
import { scrapJob } from "../controllers/job.controller.js";
import { scrapJobSchema } from "../validators/job.validator.js";
import { validate } from "../middleware/validator.js";

const router = Router();

router.post("/scrap-job", validate(scrapJobSchema), scrapJob);

export default router;
