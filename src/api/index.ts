import express from "express";

import contacts from "./contact";
import groups from "./group";
import tags from "./tag";
import email from "./email";
import sms from "./sms";
import ping from "./ping";

const router = express.Router();

// TODO: Add validation

router.use("/:organization/contact", contacts);
router.use("/:organization/group", groups);
router.use("/:organization/tag", tags);
router.use("/:organization/email", email);
router.use("/:organization/sms", sms);
router.use("/ping", ping);

export default router;
