import express from "express";
// import { sendSms } from "../lib/twilio";

const router = express.Router();

router.post("/", async (req, res) => {
  // res.json({});
  // sendSms("", "", "Test post request to /sms");
});

export default router;
