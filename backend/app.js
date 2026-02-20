import express from "express";
import "dotenv/config";

export const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*")
  next()
})

app.get("/", (req, res) => {
  res.json(["test.txt", "hello.png"])
});
