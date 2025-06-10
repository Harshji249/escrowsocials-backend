import express from "express";
import crypto from "crypto";

const router = express.Router();

const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY!;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET!;

router.get("/signature", (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);

  const signature = crypto
    .createHash("sha1")
    .update(`timestamp=${timestamp}${cloudinaryApiSecret}`)
    .digest("hex");

  res.json({
    timestamp,
    signature,
    apiKey: cloudinaryApiKey,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
});

export default router;
