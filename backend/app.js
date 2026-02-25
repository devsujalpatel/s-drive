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



// serving files
app.get("/:filename", (req, res) => {
  const {filename} = req.params;
 
  if (req.query.action === "download") {
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
  } else {
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${filename}"`
    );
  }
  res.sendFile(`${import.meta.dirname}/storage/${filename}`)
})


// serving directory content
app.get("/", async (req, res) => {
  const filesList = await readdir("./storage")
  console.log(filesList)
  res.send(filesList)
});
