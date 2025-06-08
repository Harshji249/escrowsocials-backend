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
    const { email, type } = req.query;
    const active = type === "active" ? true : false;
    const [asSeller, asBuyer] = await Promise.all([
      prisma.escrow.findMany({
        where: { seller: { email: email as string }, active },
        include: { seller: true, buyer: true },
      }),
      prisma.escrow.findMany({
        where: { buyer: { email: email as string }, active },
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

export const userDashboard = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email } = req.query;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const totalActive = await prisma.escrow.count({
      where: {
        active: true,
        OR: [
          { seller: { email: email as string } },
          { buyer: { email: email as string } },
        ],
      },
    });

    const totalPast = await prisma.escrow.count({
      where: {
        active: false,
        OR: [
          { seller: { email: email as string } },
          { buyer: { email: email as string } },
        ],
      },
    });

    const groupedByMonth = await prisma.escrow.groupBy({
      by: ["createdAt"],
      where: {
        OR: [
          { seller: { email: email as string } },
          { buyer: { email: email as string } },
        ],
      },
      _count: { _all: true },
      orderBy: { createdAt: "asc" },
    });

    const escrowsPerMonth = groupedByMonth.reduce((acc, entry) => {
      const year = entry.createdAt.getFullYear();
      const monthName = entry.createdAt.toLocaleString("default", {
        month: "short",
      });
      const key = `${year} ${monthName}`;
      acc[key] = (acc[key] || 0) + entry._count._all;
      return acc;
    }, {} as Record<string, number>);

    const formattedData = Object.entries(escrowsPerMonth).map(
      ([key, count]) => ({
        name: key,
        escrows: count,
      })
    );

    return res.status(200).json({
      totalActiveEscrows: totalActive,
      totalPastEscrows: totalPast,
      escrowsPerMonth: formattedData,
      message: "Escrow stats fetched successfully",
    });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};
