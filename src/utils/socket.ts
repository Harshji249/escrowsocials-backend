// socket.ts
import { Server } from "socket.io";

export const setupSocketIO = (io: Server) => {
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
      console.log("Message sent:", message);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });
};
