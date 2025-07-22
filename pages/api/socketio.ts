import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if ((res.socket as any).server.io) {
    res.end();
    return;
  }

  const io = new Server((res.socket as any).server, {
    path: "/api/socketio",
    addTrailingSlash: false,
  });

  (res.socket as any).server.io = io;

  io.on("connection", (socket) => {
    // ✅ Join room if it exists
    socket.on("join-room", ({ room, name }) => {
      socket.join(room);
      socket.data.username = name;

      // ✅ Notify others
      io.to(room).emit("receive-message", {
        userId: "System",
        text: `${name} joined the chat.`,
      });
    });

    // ✅ Send message
    socket.on("send-message", ({ room, message }) => {
      const username = socket.data.username || "Anonymous";
      io.to(room).emit("receive-message", {
        userId: username,
        text: message,
      });
    });
  });

  console.log("✅ Socket.IO server started");
  res.end();
};

export default SocketHandler;
