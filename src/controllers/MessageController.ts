import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const createMessage = async (req: Request, res: Response) => {
    const { content, senderId, escrowId, receiverId } = req.body;

    try {
        const message = await prisma.message.create({
            data: {
                content: "Your message here",
                senderId: senderId,         // Must exist in User table
                receiverId: receiverId,     // Must also exist
                escrowId: escrowId,
            },
        });

        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: "Failed to send message", details: err });
    }
};

export const getMessagesByEscrow = async (req: Request, res: Response) => {
    const { escrowId } = req.params;

    try {
        const messages = await prisma.message.findMany({
            where: { escrowId: Number(escrowId) }, // 👈 convert to number
            orderBy: { createdAt: "asc" },
            include: {
                sender: { select: { id: true, name: true } },
            },
        });

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch messages", details: err });
    }
};
