import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directory.routes.js";
import "dotenv/config";

export const app = express();
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// routes
import fileRoutes from "./routes/file.routes.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js"
import adminRoutes from "./routes/admin.routes.js";

// middlewares
import { checkAuth, checkDeleted } from "./middlewares/auth.middleware.js";

app.use("/directory", checkAuth, checkDeleted, directoryRoutes);
app.use("/file", checkAuth, checkDeleted, fileRoutes);
app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes)

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).json({ message: "Something went wrong!!" });
});
