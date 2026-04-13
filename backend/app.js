import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directory.routes.js";
import "dotenv/config";

export const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

import fileRoutes from "./routes/file.routes.js";
import userRoutes from "./routes/user.routes.js";
import checkAuth from "./middlewares/auth.middleware.js";

app.use("/directory", checkAuth, directoryRoutes);
app.use("/file", checkAuth, fileRoutes);
app.use("/user", userRoutes);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).json({ message: "Something went wrong!!" });
});
