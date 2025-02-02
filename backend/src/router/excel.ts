import { Router } from "express";

const excelRouter = Router();

excelRouter.get("/upload", async (req, res) => {
  res.send("Hello World!");
});

export default excelRouter;
