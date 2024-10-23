import express from "express";
import { LighthouseError } from "../common/errors";
import HttpStatusCode from "../common/errors/http-status-code";
import { LighthouseErrorMessage } from "../common/errors/lighthouse-error";
import { asyncMiddleware } from "../middlewares/async";
import { getSmsInstances } from "../model/sms-instances";
import {
  ContactLog,
  getContactLogs,
  getContactLogsForContact,
} from "../model/contact-logs";

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

    let contactLogs: ContactLog[] = [];
    if (req.query.contactId) {
      // validateQuery should verify that this is a valid string
      contactLogs = await getContactLogsForContact(
        req.organizationId,
        req.query.contactId as string
      );
    } else {
      contactLogs = await getContactLogs(req.organizationId);
    }

    res.json(contactLogs);
  })
);

export default router;
