import express from "express";
import "dotenv/config";
import { readdir } from "fs/promises";

export const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*")
  next()
})

// app.use(express.static("storage"))

app.use((req, res, next) => {
  if(req.query.action = "download") {
    res.set('Content-Disposition', "attatchment")
  }
  express.static("storage")(req, res, next);
})

app.get("/", async (req, res) => {
  const filesList = await readdir("./storage")
  console.log(filesList)
  res.send(filesList)
});
