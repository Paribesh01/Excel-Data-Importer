import { Router } from "express";
import excelRouter from "./excel";

const router = Router();

router.use("/excel", excelRouter);

export default router;
