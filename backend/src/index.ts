import express from "express";
import cors from "cors";
import router from "./router";
import connectDB from "./db/connect";

const app = express();

app.use(express.json());
connectDB();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1", router);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
