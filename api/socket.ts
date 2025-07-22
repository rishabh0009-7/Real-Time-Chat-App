import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

// This disables the default bodyParser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
  // Prevent multiple socket servers on dev hot reload
  if ((res.socket as any).server.io) {
    console.log("✅ Socket is already running");
    res.end();
    return;
  }

  const io = new Server((res.socket as any).server, {
    path: "/api/socketio", 
  });
  (res.socket as any).server.io = io;

  console.log("✅ Socket is now running");

  io.on("connection", (socket) => {
    console.log("🔌 A user connected");

    socket.on("join-room", ({ room, name }) => {
      socket.join(room);
      socket.data.username = name;

      io.to(room).emit("user-joined", `${name} joined the chat`);
    });

    socket.on("send-message", ({ room, message }) => {
      const username = socket.data.username || "Anonymous";

      io.to(room).emit("receive-message", {
        user: username,
        text: message,
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ A user disconnected");
    });
  });

  res.end();
};

export default SocketHandler;
