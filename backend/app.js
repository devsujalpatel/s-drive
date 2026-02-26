import express from "express";
import "dotenv/config";
import { readdir, rename } from "fs/promises";
import { createWriteStream } from "fs";
import cors from "cors"

export const app = express();

app.disable("x-powered-by");
app.use(express.json());

// Enabling Cors from anywhere
app.use(cors({
  origin: "http://localhost:5173"
}))


// Routes 
import filesRouter from "./routes/files.routes.js"


// serving directory content
app.get("/api/v1/directory", async (req, res) => {
  const filesList = await readdir("./storage")
  console.log(filesList)
  res.send(filesList)
});


app.use("/api/v1/files", filesRouter)




