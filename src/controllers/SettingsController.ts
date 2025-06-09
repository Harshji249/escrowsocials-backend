import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/EmailVerification";

const prisma = new PrismaClient();

export const updateProfile = async (req: any, res: Response): Promise<any> => {
  try {
    const { name, email } = req.body;
    const { id } = req.user;

    if (email) {
      const user = await prisma.user.findFirst({
        where: {
          email,
        },
      });
      const token = jwt.sign(user!, process.env.JWT_SECRET!, {
        expiresIn: "1h",
      });

      const link = `${process.env.BACKEND_URL}/api/settings/verify?token=${token}&email=${email}`;
      await sendVerificationEmail(email, link);
    }
    await prisma.user.update({
      where: { id },
      data: {
        name,
      },
    });
    return res.status(201).json({ message: "Escrow created successfully" });
  } catch (error: any) {
    throw new Error(error);
  }
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
      data: { email: payload.email },
    });

    res.redirect(`${process.env.FRONTEND_URL}/login`);
  } catch (err) {
    res.status(400).send("Invalid or expired token");
  }
};
