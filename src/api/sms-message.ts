import express from "express";
import { LighthouseError } from "../common/errors";
import HttpStatusCode from "../common/errors/http-status-code";
import { LighthouseErrorMessage } from "../common/errors/lighthouse-error";
import { asyncMiddleware } from "../middlewares/async";
import { getSmsInstances } from "../model/sms-instances";

const router = express.Router();

router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    res.json({ message: "Not implemented." });
  })
);

export default router;
