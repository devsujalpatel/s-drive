import express from "express";

const app = express();

app.disable("x-powered-by");
const port = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.end("Hello World! 😀");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
