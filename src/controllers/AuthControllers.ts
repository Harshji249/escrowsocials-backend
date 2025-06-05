import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/EmailVerification";

const prisma = new PrismaClient();

export const createUser = async (req: Request, res: Response): Promise<any> => {
  const { name, email, password }: any = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing)
    return res.status(400).json({ message: "Email already registered" });

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });

  // Send email
  const link = `http://localhost:3000/api/auth/verify?token=${token}`;
  await sendVerificationEmail(email, link);

  res
    .status(201)
    .json({ message: "Signup successful, please verify your email." });
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { token } = req.query;
  try {
    const payload: any = jwt.verify(token as string, process.env.JWT_SECRET!);
    await prisma.user.update({
      where: { id: payload.id },
      data: { verified: true },
    });

    // Redirect to frontend dashboard
    res.redirect(`http://localhost:5173/dashboard?token=${token}`);
  } catch (err) {
    res.status(400).send("Invalid or expired token");
  }
};
