import express from "express";
import "dotenv/config";
import cors from "cors";

export const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

// Enabling Cors from frontend url
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.get("/", (req, res) => {
  res.end("Hello world");
});

// Routes
import filesRouter from "./routes/files.routes.js";
import directroyRouter from "./routes/directories.routes.js";

app.use("/api/v1/file", filesRouter); // files routes
app.use("/api/v1/directory", directroyRouter); // directory routes

// Error Handler Middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    message: "Something went wrong",
  });
});
