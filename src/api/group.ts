import express from "express";
import {
  addContactsToGroup,
  createGroup,
  deleteGroup,
  getGroupById,
  getGroups,
  removeContactFromGroup,
  searchGroupsByName,
  updateGroup,
} from "../model/groups";
import { LighthouseError } from "../common/errors";
import HttpStatusCode from "../common/errors/http-status-code";
import { LighthouseErrorMessage } from "../common/errors/lighthouse-error";
import { asyncMiddleware } from "../middlewares/async";

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

    if (req.query.name) {
      const contacts = await searchGroupsByName(
        req.organizationId,
        req.query.name as string
      );
      res.json(contacts);
    } else {
      const groups = await getGroups(req.organizationId);
      res.json(groups);
    }
  })
);

router.get(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    const groupResponse = await getGroupById(id);
    if (!groupResponse) {
      res.sendStatus(404);
      return;
    }

    res.json(groupResponse);
  })
);

router.post(
  "/",
  asyncMiddleware(async (req, res) => {
    const group = req.body;
    group.dateCreated = new Date();
    group.organizationId = req.organizationId;

    await createGroup(group);
    res.sendStatus(201);
  })
);

router.patch(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    const group = req.body;

    await updateGroup(group);
    res.sendStatus(200);
  })
);

// Add contacts to group
router.post(
  "/:id/contact",
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    const { contactIds } = req.body;
    await addContactsToGroup(contactIds, id);
    res.sendStatus(201);
  })
);

// Remove contact from group
router.delete(
  "/:id/contact/:contactId",
  asyncMiddleware(async (req, res) => {
    const { id, contactId } = req.params;
    await removeContactFromGroup(contactId, id);
    res.sendStatus(200);
  })
);

router.delete(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    await deleteGroup(id);
    res.sendStatus(200);
  })
);

export default router;
