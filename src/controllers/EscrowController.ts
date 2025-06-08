import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { sendVerificationEmail } from "../utils/EmailVerification";

const prisma = new PrismaClient();

export const createEscrow = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { seller, buyer, price, accountType, accountName, comissionType } =
      req.body;
    const [sellerUser, buyerUser] = await Promise.all([
      prisma.user.findUnique({ where: { email: seller } }),
      prisma.user.findUnique({ where: { email: buyer } }),
    ]);
    const escrow = await prisma.escrow.create({
      data: {
        sellerId: sellerUser?.id!,
        buyerId: buyerUser?.id!,
        buyerEmail: buyer,
        price: +price,
        accountType,
        accountName,
        status: 0,
        onboarding: buyerUser ? true : false,
        comissionType,
      },
    });
    if (!buyerUser) {
      const link = `${process.env.FRONTEND_URL}/signup?transaction=${escrow.id}`;
      await sendVerificationEmail(buyer, link);
      const sellerLink = `${process.env.FRONTEND_URL}/transactions/${escrow.id}`;
      await sendVerificationEmail(seller, sellerLink);
    } else {
      const link = `${process.env.FRONTEND_URL}/transactions/${escrow.id}`;
      await sendVerificationEmail(buyer, link);
      const sellerLink = `${process.env.FRONTEND_URL}/transactions/${escrow.id}`;
      await sendVerificationEmail(seller, sellerLink);
    }
    return res.status(201).json({ message: "Escrow created successfully" });
  } catch (error: any) {
    throw new Error(error);
  }
};

export const fetchUserEscrow = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email } = req.query;
    const [asSeller, asBuyer] = await Promise.all([
      prisma.escrow.findMany({
        where: { seller: { email: email as string } },
        include: { seller: true, buyer: true },
      }),
      prisma.escrow.findMany({
        where: { buyer: { email: email as string } },
        include: { seller: true, buyer: true },
      }),
    ]);

    return res.status(200).json({
      escrowsAsSeller: asSeller,
      escrowsAsBuyer: asBuyer,
      message: "Escrows fetched successfully",
    });
  } catch (error: any) {
    throw new Error(error);
  }
};
