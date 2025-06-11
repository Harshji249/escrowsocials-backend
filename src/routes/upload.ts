import express, { Request, Response } from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import { fetchuser } from "../middlewares/fetchuser";
import cloudinary from "../utils/cloudinary";

const prisma = new PrismaClient();
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload-id", fetchuser, upload.single("file"), (req: Request, res: Response) => {
  const user = (req as any).user;
  const file = req.file;

  if (!file) {
    res.status(400).json({ message: "No file uploaded" });
    return; // <-- 🔴 this was missing, adding it fixes the error
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: "escrow_ids",
      resource_type: "image",
    },
    (error, result) => {
      if (error || !result) {
        console.error("Cloudinary error:", error);
        res.status(500).json({ message: "Cloudinary upload failed" });
        return; // 🔴 required
      }

      prisma.user.update({
        where: { id: user.id },
        data: { profileUrl: result.secure_url },
      })
        .then(() => {
          res.status(200).json({
            message: "ID uploaded to Cloudinary",
            profileUrl: result.secure_url,
          });
          return; // ✅ ensures response is returned
        })
        .catch((dbErr) => {
          console.error("DB update error:", dbErr.message);
          res.status(500).json({ message: "Database update failed" });
          return;
        });
    }
  );

  uploadStream.end(file.buffer);
});

export default router;
