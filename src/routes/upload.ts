// routes/upload.ts
import express from "express";
import multer from "multer";
import cloudinary from "../utils/cloudinary";
import { PrismaClient } from "@prisma/client";
import { fetchuser } from "../middlewares/fetchuser"; // ← do not change


const prisma = new PrismaClient();
const router = express.Router();

// Use memory storage so we can send buffer to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload-id", fetchuser, upload.single("file"), function (req, res) {
  (async () => {
    try {
      const user = (req as any).user;
      const file = (req as any).file;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "user_ids",
          resource_type: "image",
        },
        async (error, result) => {
          if (error || !result) {
            console.error("Cloudinary error:", error);
            return res.status(500).json({ message: "Upload failed" });
          }

          await prisma.user.update({
            where: { id: user.id },
            data: { profileUrl: result.secure_url },
          });

          return res.status(200).json({
            message: "Image uploaded and saved",
            profileUrl: result.secure_url,
          });
        }
      );

      // Pipe buffer into the Cloudinary stream
      const { Readable } = await import("stream");
      Readable.from(file.buffer).pipe(stream);
    } catch (err: any) {
      console.error("Upload error:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  })();
});


export default router;
