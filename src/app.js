import express from "express";
import "dotenv/config";

export const app = express();

app.disable("x-powered-by");
app.use(express.json());


app.get("/", (req, res, next) => {
  try {
    throw new Error("Mene Pheka error ")
    res.send("Hello World! 😀")
  } catch (error) {
    next(error)
  }
});

app.use((err, req, res, next) => {
    res.send(err.message)
})