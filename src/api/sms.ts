import express from "express";
import { asyncMiddleware } from "../middlewares/async";
import { validateBody } from "../middlewares/validation";
import Joi from "joi";
import { sendSms } from "../lib/twilio";
import { Contact, getContactById, getContactsByGroup } from "../model/contacts";
import { LighthouseError } from "../common/errors";
import HttpStatusCode from "../common/errors/http-status-code";
import { LighthouseErrorMessage } from "../common/errors/lighthouse-error";
import { ContactMode, createContactLog } from "../model/contact-logs";
import { createSmsMessage, SmsMessageDirection } from "../model/sms-messages";
import { createSmsInstance } from "../model/sms-instances";
import { createGroupContactLog } from "../model/group-contact-logs";

const router = express.Router();

type sendSmsToContactOptions = {
  organizationId: string;
  contact: Contact;
  body: string;
  initiatorEmail: string;
  smsInstanceId: string;
  associatedGroupId: string | null;
};

async function sendSmsToContact(options: sendSmsToContactOptions) {
  const targetPhoneNumber = options.contact.vectors.phone;
  let contactSuccessful = false;
  let twilioMessageId = "";
  try {
    console.log("test here");
    twilioMessageId = await sendSms(targetPhoneNumber, options.body);
    contactSuccessful = true;
  } catch (e) {
    console.log(e);
    // TODO send this error log somewhere
    contactSuccessful = false;
  } finally {
    await createSmsMessage({
      messageId: contactSuccessful ? twilioMessageId : undefined,
      organizationId: options.organizationId,
      contactId: options.contact._id,
      message: options.body,
      messageDirection: SmsMessageDirection.Outbound,
      successful: contactSuccessful,
    });
  }

  await createContactLog({
    organizationId: options.organizationId,
    contactMode: ContactMode.Sms,
    contactId: options.contact._id,
    instanceId: options.smsInstanceId,
    initiatorEmail: options.initiatorEmail,
    successful: contactSuccessful,
    associatedGroupId: options.associatedGroupId,
  });
}

router.post(
  "/",
  validateBody(
    Joi.object().keys({
      targetType: Joi.string().valid("contact", "group").required(),
      initiatorEmail: Joi.string().required(),
      targetId: Joi.string().required(),
      message: Joi.string().required(),
    })
  ),
  asyncMiddleware(async (req, res) => {
    const targetType = req.body.targetType;
    if (!req.organizationId) {
      throw new LighthouseError(
        HttpStatusCode.BAD_REQUEST,
        LighthouseErrorMessage.GATEWAY_INVALID_URL
      );
    }

    const smsInstance = await createSmsInstance(
      req.organizationId,
      req.body.message
    );

    if (targetType === "contact") {
      const contact = await getContactById(req.body.targetId);
      if (!contact) {
        throw new LighthouseError(
          HttpStatusCode.NOT_FOUND,
          LighthouseErrorMessage.CONTACT_NOT_FOUND
        );
      }
      await sendSmsToContact({
        organizationId: req.organizationId,
        contact,
        body: req.body.message,
        initiatorEmail: req.body.initiatorEmail,
        smsInstanceId: smsInstance._id,
        associatedGroupId: null,
      });
    } else if (targetType === "group") {
      const groupId = req.body.targetId;
      const contactsInGroup = await getContactsByGroup(groupId);

      if (contactsInGroup.length === 0) {
        throw new LighthouseError(
          HttpStatusCode.BAD_REQUEST,
          LighthouseErrorMessage.GROUP_HAS_NO_MEMBERS
        );
      }

      console.log(contactsInGroup, groupId);
      contactsInGroup.forEach((contact) => {
        console.log(contact);
        sendSmsToContact({
          // @ts-ignore - organizationId is checked above. This is a typescript bug
          organizationId: req.organizationId,
          contact,
          body: req.body.message,
          initiatorEmail: req.body.initiatorEmail,
          smsInstanceId: smsInstance._id,
          associatedGroupId: groupId,
        });
      });

      await createGroupContactLog({
        organizationId: req.organizationId,
        groupId: groupId,
        instanceId: smsInstance._id,
        initiatorEmail: req.body.initiatorEmail,
        contactMode: ContactMode.Sms,
      });
    } else {
      // Should never get here because validation middleware should catch this first
      throw new LighthouseError(
        HttpStatusCode.BAD_REQUEST,
        LighthouseErrorMessage.VALIDATION_BAD_BODY
      );
    }
  })
);

export default router;
