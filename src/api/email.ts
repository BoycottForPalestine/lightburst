import express from "express";
import { sendEmail } from "../lib/postmark";

const router = express.Router();

router.post("/", async (req, res) => {
  res.json({});
  sendEmail("", "", "", "", "", "");
});

export default router;
