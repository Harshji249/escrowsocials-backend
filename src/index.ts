import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import uploadRoutes from "./routes/upload";
import messageRoutes from "./routes/message";

// Routes
import authRoutes from "./routes/auth";
import escrowRoutes from "./routes/escrow";
import settingRoutes from "./routes/settings";
import adminRoutes from "./routes/admin";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const prisma = new PrismaClient();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public/images"));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Socket.IO Events
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("joinRoom", (roomId: string) => {
    console.log("Join room:", roomId);
    socket.join(roomId);
  });

  socket.on("sendMessage", (message) => {
    io.to(message.roomId).emit("receiveMessage", {
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
    });
    console.log(message);
  });
  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/escrow", escrowRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/messages", messageRoutes);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
