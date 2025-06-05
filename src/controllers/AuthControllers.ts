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

  const link = `${process.env.BACKEND_URL}/api/auth/verify?token=${token}`;
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

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  } catch (err) {
    res.status(400).send("Invalid or expired token");
  }
};

export const loginUser = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.verified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first" });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
