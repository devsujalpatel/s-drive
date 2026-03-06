import { app } from "./src/app";
import "dotenv/config";

const port = 3000;


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
