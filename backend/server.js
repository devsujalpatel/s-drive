import { connectDB, disconnectDB } from "./config/db.js";
import { app } from "./app.js";
import "dotenv/config";

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server Started on Port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    disconnectDB()
  });
