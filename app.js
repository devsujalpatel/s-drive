import express from "express";
import "dotenv/config";
import { open } from "node:fs/promises";

export const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use((req, res, next) => {
    console.log("Global Middleware");
    next();
})


app.get("/", (req, res, next) => {
  try {
    res.send("Hello World! 😀");
  } catch (error) {
    next(error);
  }
});

app.use(express.static("public"));

app.get("/test", async (req, res, next) => {
    // const fileHandle = await open("src/image.png")
    // const readStream = fileHandle.createReadStream();
    // const stats = await fileHandle.stat();
    // res.setHeader("Content-Length", stats.size)
    // res.setHeader("Content-Type", "image/png")
    // readStream.pipe(res)
    res.sendFile(`${import.meta.dirname}/public/images/image.png`)
})


app.use((err, req, res, next) => {
    res.send(err.message);
})