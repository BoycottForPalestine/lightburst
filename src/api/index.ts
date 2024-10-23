import express from "express";

import contact from "./contact";
import group from "./group";
import tag from "./tag";
import email from "./email";
import sms from "./sms";
import ping from "./ping";
import smsMessage from "./sms-message";
import smsInstance from "./sms-instance";
import groupContactLog from "./group-contact-log";
import emailInstance from "./email-instance";
import contactLog from "./contact-log";

const router = express.Router();

router.use("/:organization/contact", contact);
router.use("/:organization/contact-log", contactLog);
router.use("/:organization/email-instance", emailInstance);
router.use("/:organization/group", group);
router.use("/:organization/group-contact-log", groupContactLog);
router.use("/:organization/tag", tag);
router.use("/:organization/email", email);
router.use("/:organization/sms", sms);
router.use("/:organization/sms-instance", smsInstance);
router.use("/:organization/sms-message", smsMessage);
router.use("/ping", ping);

export default router;
