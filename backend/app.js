import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import checkAuth from "./middlewares/auth.middleware.js";

import { connectDB } from "./db.js";

try {
  const db = await connectDB();

  const app = express();
  app.use((req, res, next) => {
    req.db = db; // Attach the database instance to the request object
    next();
  });
  app.use(cookieParser());
  app.use(express.json());
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    }),
  );

  app.use("/directory", checkAuth, directoryRoutes);
  app.use("/file", checkAuth, fileRoutes);
  app.use("/user", userRoutes);

  app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).json({ message: "Something went wrong!!" });
  });

  app.listen(8000, () => {
    console.log(`Server Started`);
  });
} catch (error) {
  console.error("Failed to start server:", error);
}
