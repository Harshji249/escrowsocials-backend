// index.ts
import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { PrismaClient } from "@prisma/client";

// Routes
import authRoutes from "./routes/auth";
import escrowRoutes from "./routes/escrow";
import settingRoutes from "./routes/settings";
import adminRoutes from "./routes/admin";
import uploadRoutes from "./routes/upload";
import messageRoutes from "./routes/message";

// Socket Setup
import { setupSocketIO } from "./utils/socket";

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

// Apply Middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public/images"));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/escrow", escrowRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/messages", messageRoutes);

// Setup Socket.IO
setupSocketIO(io);

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
