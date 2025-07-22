import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

const validRooms = new Set<string>();
const userCounts: Record<string, number> = {};

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
    // ✅ Handle room creation
    socket.on("create-room", (roomCode: string) => {
      validRooms.add(roomCode);
      console.log(`Room created: ${roomCode}`);
    });

    // ✅ Check room validity before joining
    socket.on("check-room", (roomCode: string) => {
      const exists = validRooms.has(roomCode);
      // 🔥 FIXED: Match frontend event listener
      socket.emit("room-exists", exists);
    });

    // ✅ Join room if it exists
    socket.on("join-room", ({ room, name }) => {
      if (!validRooms.has(room)) {
        socket.emit("room-invalid");
        return;
      }

      socket.join(room);
      socket.data.username = name;

      // ✅ Track users per room
      userCounts[room] = (userCounts[room] || 0) + 1;
      io.to(room).emit("user-count", userCounts[room]);

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

    // ✅ Handle disconnection
    socket.on("disconnecting", () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          userCounts[room] = Math.max(0, (userCounts[room] || 1) - 1);
          io.to(room).emit("user-count", userCounts[room]);
        }
      }
    });
  });

  console.log("✅ Socket.IO server started");
  res.end();
};

export default SocketHandler;
