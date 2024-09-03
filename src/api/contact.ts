import express from "express";
import {
  Contact,
  createContact,
  deleteContact,
  getContactById,
  getContacts,
  searchContactsByName,
  updateContact,
} from "../model/contacts";
import { getGroupsByContact } from "../model/groups";
import { asyncMiddleware } from "../middlewares/async";
import { LighthouseError } from "../common/errors";
import HttpStatusCode from "../common/errors/http-status-code";
import { LighthouseErrorMessage } from "../common/errors/lighthouse-error";

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
      const contacts = await searchContactsByName(
        req.organizationId,
        req.query.name as string
      );
      res.json(contacts);
    } else {
      const contacts = await getContacts(req.organizationId);
      res.json(contacts);
    }
  })
);

router.get(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    const contact = await getContactById(id);
    if (!contact) {
      throw new LighthouseError(
        HttpStatusCode.NOT_FOUND,
        LighthouseErrorMessage.CONTACT_NOT_FOUND
      );
    }

    const groups = await getGroupsByContact(id);
    res.json({
      contact,
      groups,
    });
  })
);

router.post(
  "/",
  asyncMiddleware(async (req, res) => {
    const contact = req.body;
    const organizationId = req.organizationId;
    const dateCreated = new Date();

    contact.organizationId = organizationId;
    contact.dateCreated = dateCreated;
    try {
      const insertedContact = await createContact(contact);
      res.json({
        _id: insertedContact._id,
      });
    } catch (e) {
      console.error(e);
      res.sendStatus(500);
    }
  })
);

router.patch(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    const contact = req.body;
    try {
      await updateContact(contact);
      res.sendStatus(200);
    } catch (e) {
      console.error(e);
      res.sendStatus(500);
    }
  })
);

router.delete(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    try {
      await deleteContact(id);
      res.sendStatus(200);
    } catch (e) {
      console.error(e);
      res.sendStatus(500);
    }
  })
);

export default router;
