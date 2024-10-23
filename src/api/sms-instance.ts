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
    if (!req.organizationId) {
      throw new LighthouseError(
        HttpStatusCode.BAD_REQUEST,
        LighthouseErrorMessage.GATEWAY_INVALID_URL
      );
    }

    const smsInstances = await getSmsInstances(req.organizationId);
    res.json(smsInstances);
  })
);

export default router;
