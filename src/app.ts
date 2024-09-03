import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

import api from "./api";
import { organizationMiddleware } from "./middlewares/organization";
import { LighthouseError } from "./common/errors";

require("dotenv").config();

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

// Pulls org id from URL
app.use(organizationMiddleware);

app.use("/api/v1", api);

// This is our catch-all error handler to make sure the server doesn't
// implode on 500s and also returns the correct error response for thrown
// errors downstream in the app
// Errors are forwarded via async-middleware
// eslint-disable-next-line
app.use(function (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (err instanceof LighthouseError) {
    return res.status(err.httpCode).json({
      message: err.message,
    });
  }
  console.log(err);
  return res.status(500).send("Internal Server Error");
});

export default app;
