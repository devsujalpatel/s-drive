import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParse from "cookie-parser";

export const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use(cookieParse());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

// Enabling Cors from frontend url
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  res.end("Hello world");
});

// Routes
import filesRouter from "./routes/files.routes.js";
import directoryRouter from "./routes/directories.routes.js";
import userRoutes from "./routes/users.routes.js";
import { checkAuth } from "./middlewares/auth.middleware.js";

app.use("/api/v1/file", checkAuth, filesRouter); // files routes
app.use("/api/v1/directory", checkAuth, directoryRouter); // directory routes
app.use("/api/v1/user", userRoutes); // user routes

// Error Handler Middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    message: "Something went wrong",
  });
});
