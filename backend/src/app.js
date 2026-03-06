import express from "express";
import "dotenv/config";
import cors from "cors";

export const app = express();

app.disable("x-powered-by");
app.use(express.json());

// Enabling Cors from frontend url
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

// Routes
import filesRouter from "./routes/files.routes.js";
import directroyRouter from "./routes/directories.routes.js";

app.use("/api/v1/files", filesRouter); // files routes
app.use("/api/v1/directory", directroyRouter); // directory routes
