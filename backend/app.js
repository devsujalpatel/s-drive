import express from "express";
import "dotenv/config";
import { readdir, rename } from "fs/promises";

export const app = express();

app.disable("x-powered-by");
app.use(express.json());

// Enabling Cors from anywhere
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
  })
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

app.delete("/:filename",  async (req, res) => {
  const {filename} = req.params;

  const filePath = `./storage/${filename}`;
  const newPath = `./trash/${filename}`
   try {
   await rename(filePath, newPath, (err) => {
    if (err) throw err;
   });
   res.status(204).json({
    message: "File Deleted Successfully"
  })

 } catch (error) {
  console.error(error)
  res.status(404).json({
    message: "File not found"
  })
 }
})
app.patch("/:filename",  async (req, res) => {
  const {filename} = req.params;
  const {newFilename} = req.body;

  const filePath = `./storage/${filename}`;
  const newPath = `./storage/${newFilename}`;
   try {
   await rename(filePath, newPath, (err) => {
    if (err) throw err;
   });
   res.status(204).json({
    message: "File Renamed Successfully"
  })

 } catch (error) {
  console.error(error)
  res.status(404).json({
    message: "File not found"
  })
 }
})


// serving directory content
app.get("/", async (req, res) => {
  const filesList = await readdir("./storage")
  console.log(filesList)
  res.send(filesList)
});
