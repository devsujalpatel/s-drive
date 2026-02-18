import { app } from "./app";
import "dotenv/config";

const port = process.env.PORT || 4000;


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
