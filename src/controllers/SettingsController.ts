import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "../utils/EmailVerification";

const prisma = new PrismaClient();

export const updateProfile = async (req: any, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      console.log("req.user is undefined");
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { name, email } = req.body;
    const { id, email: currentEmail } = req.user;

    if (!name && !email) {
      return res.status(400).json({ message: "Name or email is required" });
    }

    // Validate inputs
    if (name && (typeof name !== "string" || name.trim().length < 2)) {
      return res
        .status(400)
        .json({ message: "Name must be a string with at least 2 characters" });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const updateData: { name?: string; email?: string; verified?: boolean } =
      {};

    if (name) {
      updateData.name = name.trim();
    }

    if (email && email !== currentEmail) {
      const existingUser = await prisma.user.findFirst({
        where: { email },
      });
      if (existingUser && existingUser.id !== id) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const token = jwt.sign({ id, email }, process.env.JWT_SECRET!, {
        expiresIn: "1h",
      });
      const link = `${process.env.BACKEND_URL}/api/settings/verify?token=${token}&email=${email}`;

      await sendVerificationEmail(email, link);

      updateData.verified = false;
      return res
        .status(200)
        .json({ email: email, message: "Verify your new email to update" });
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return res
      .status(200)
      .json({ message: "Profile updated successfully", data: updateData });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const updatePassword = async (req: any, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { currentPassword, newPassword } = req.body;
    const { id } = req.user;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { password: true },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Error updating password:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const updateBankInfo = async (req: any, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { accountEmail, accountHolder, address, city, postalCode, country } =
      req.body;
    const { id } = req.user;

    if (
      !accountEmail ||
      !accountHolder ||
      !address ||
      !city ||
      !postalCode ||
      !country
    ) {
      return res.status(400).json({ message: "All bank details are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(accountEmail)) {
      return res.status(400).json({ message: "Invalid account email format" });
    }

    if (typeof accountHolder !== "string" || accountHolder.trim().length < 2) {
      return res
        .status(400)
        .json({ message: "Account holder name must be at least 2 characters" });
    }

    await prisma.bankInfo.upsert({
      where: { userId: id },
      update: {
        accountEmail,
        accountHolder: accountHolder.trim(),
        address,
        city,
        postalCode,
        country,
      },
      create: {
        accountEmail,
        accountHolder: accountHolder.trim(),
        address,
        city,
        postalCode,
        country,
        userId: id,
      },
    });

    return res
      .status(200)
      .json({ message: "Bank details updated successfully" });
  } catch (error: any) {
    console.error("Error updating bank info:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const fetchBankInfo = async (req: any, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const { id } = req.user;

    const data = await prisma.bankInfo.findFirst({
      where: { userId: id },
    });

    return res
      .status(200)
      .json({ data, message: "Bank details updated successfully" });
  } catch (error: any) {
    console.error("Error updating bank info:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { token } = req.query;
  try {
    const payload: any = jwt.verify(token as string, process.env.JWT_SECRET!);
    const { id, email } = payload;

    await prisma.user.update({
      where: { id },
      data: { email, verified: true },
    });

    res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
  } catch (err) {
    res.status(400).send("Invalid or expired token");
  }
};
