import { Router } from "express";
import excelRouter from "./excel";

const router = Router();

router.get("/excel", excelRouter);

export default router;
