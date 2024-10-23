import dotenv from "dotenv";
dotenv.config();
import app from "./app";

const port = process.env.PORT || 5002;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
});
