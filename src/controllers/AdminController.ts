import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/EmailVerification";

const prisma = new PrismaClient();

export const getDashboardData = async (
  req: any,
  res: Response
): Promise<any> => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const escrowCounts = await prisma.escrow.groupBy({
      by: ["active"],
      _count: {
        _all: true,
      },
    });
    const counts = escrowCounts.reduce(
      (acc, item) => {
        acc[item.active ? "active" : "inactive"] = item._count._all;
        return acc;
      },
      { active: 0, inactive: 0 }
    );

    return res.status(201).json({
      data: {
        active: counts.active,
        past: counts.inactive,
        comission: 0,
      },
      message: "Escrow created successfully",
    });
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

export const fetchAllEscrows = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { type } = req.query;

    // Validate type parameter
    if (type !== "active" && type !== "past") {
      res
        .status(400)
        .json({ message: "Invalid type parameter. Use 'active' or 'past'." });
      return;
    }

    const isActive = type === "active" ? true : false;

    const escrows = await prisma.escrow.findMany({
      where: { active: isActive },
      include: {
        seller: { select: { id: true, name: true, email: true } },
        buyer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      data: escrows,
      message: `Successfully fetched ${type} escrows`,
    });
  } catch (error: any) {
    console.error("❌ Error fetching escrows:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateStep = async (req: any, res: Response): Promise<any> => {
  try {
    // if (req.user.role !== "admin") {
    //   return res.status(401).json({ message: "Unauthorized" });
    // }
    const escrow = await prisma.escrow.findFirst({
      where: { id: req.body.transaction },
    });
    if (!escrow) return;
    await prisma.escrow.update({
      where: { id: escrow.id },
      data: {
        status: req.body.step,
      },
    });
    return res.status(200).json({
      message: "Step updated successfully",
    });
  } catch (error: any) {
    throw new Error(error);
  }
};
