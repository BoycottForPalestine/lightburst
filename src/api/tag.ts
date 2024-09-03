import express from "express";
import {
  addContactsToTag,
  createTag,
  deleteTag,
  getAllTags,
  getTagById,
  getTagWithMembers,
  removeContactFromTag,
  searchTagsByName,
  updateTag,
} from "../model/tags";
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
      const contacts = await searchTagsByName(
        req.organizationId,
        req.query.name as string
      );
      res.json(contacts);
    } else {
      const groups = await getAllTags(req.organizationId);
      res.json(groups);
    }
  })
);

router.get(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    const groupResponse = await getTagWithMembers(id);
    if (!groupResponse) {
      throw new LighthouseError(
        HttpStatusCode.NOT_FOUND,
        LighthouseErrorMessage.TAG_NOT_FOUND
      );
    }

    res.json(groupResponse);
  })
);

router.post(
  "/",
  asyncMiddleware(async (req, res) => {
    const { color, name } = req.body;
    if (!req.organizationId) {
      throw new LighthouseError(
        HttpStatusCode.BAD_REQUEST,
        LighthouseErrorMessage.GATEWAY_INVALID_URL
      );
    }
    await createTag(req.organizationId, name, color);
    res.sendStatus(201);
  })
);

router.patch(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    const tag = req.body;
    await updateTag(id, tag);
    res.sendStatus(200);
  })
);

// Add contacts to group
router.post(
  "/:id/contact",
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    const { contactIds } = req.body;
    await addContactsToTag(contactIds, id);
    res.sendStatus(201);
  })
);

// Remove contact from group
router.delete(
  "/:id/contact/:contactId",
  asyncMiddleware(async (req, res) => {
    const { id, contactId } = req.params;
    await removeContactFromTag(contactId, id);
    res.sendStatus(200);
  })
);

router.delete(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    await deleteTag(id);
    res.sendStatus(200);
  })
);

export default router;
