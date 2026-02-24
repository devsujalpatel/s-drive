import express from "express";
import "dotenv/config";
import { readdir } from "fs/promises";

export const app = express();

app.disable("x-powered-by");
app.use(express.json());

// Enabling Cors from anywhere
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*")
  next()
})


// servering files
app.use((req, res, next) => {
  if(req.query.action === "download") {
    res.setHeader('Content-Disposition', "attachment")
  }
  express.static("storage")(req, res, next);
})

// serving directory content
app.get("/", async (req, res) => {
  const filesList = await readdir("./storage")
  console.log(filesList)
  res.send(filesList)
});
