import { app } from "./src/app.js";
import "dotenv/config";

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
