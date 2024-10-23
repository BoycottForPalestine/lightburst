import express from "express";
import { LighthouseError } from "../common/errors";
import HttpStatusCode from "../common/errors/http-status-code";
import { LighthouseErrorMessage } from "../common/errors/lighthouse-error";
import { asyncMiddleware } from "../middlewares/async";
import {
  getGroupContactLogs,
  getGroupContactLogsForGroup,
  GroupContactLog,
} from "../model/group-contact-logs";

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

    let groupContactLogs: GroupContactLog[] = [];
    if (req.query.groupId) {
      // validateQuery should verify that this is a valid string
      groupContactLogs = await getGroupContactLogsForGroup(
        req.organizationId,
        req.query.contactId as string
      );
    } else {
      groupContactLogs = await getGroupContactLogs(req.organizationId);
    }

    res.json(groupContactLogs);
  })
);

export default router;
