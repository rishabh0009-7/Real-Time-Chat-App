import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

// In-memory storage for valid rooms (in production, use Redis/Database)
const validRooms = new Set<string>();
const roomUsers = new Map<string, Set<string>>();

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if ((res.socket as any).server.io) {
    res.end();
    return;
  }

  const io = new Server((res.socket as any).server, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  (res.socket as any).server.io = io;

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // ✅ Create a new room
    socket.on("create-room", (roomCode) => {
      validRooms.add(roomCode);
      roomUsers.set(roomCode, new Set());
      console.log(`Room created: ${roomCode}`);
      socket.emit("room-created", roomCode);
    });

    // ✅ Validate and join room
    socket.on("join-room", ({ room, name }) => {
      // Check if room exists in valid rooms
      if (!validRooms.has(room)) {
        socket.emit("room-error", "Invalid room code. Please use a generated room code.");
        return;
      }

      socket.join(room);
      socket.data.username = name;
      socket.data.room = room;

      // Add user to room users set
      if (!roomUsers.has(room)) {
        roomUsers.set(room, new Set());
      }
      roomUsers.get(room)?.add(name);

      // ✅ Notify others in the room
      socket.to(room).emit("receive-message", {
        userId: "System",
        text: `${name} joined the chat.`,
        timestamp: Date.now(),
        type: "system"
      });

      // Send current room users count
      const userCount = roomUsers.get(room)?.size || 0;
      io.to(room).emit("room-users-update", { count: userCount });

      console.log(`${name} joined room: ${room}`);
    });

    // ✅ Send message with enhanced validation
    socket.on("send-message", ({ room, message }) => {
      // Validate room exists and user is in the room
      if (!validRooms.has(room) || !socket.rooms.has(room)) {
        socket.emit("message-error", "Cannot send message to invalid room.");
        return;
      }

      const username = socket.data.username || "Anonymous";
      const messageData = {
        userId: username,
        text: message.trim(),
        timestamp: Date.now(),
        type: "user"
      };

      io.to(room).emit("receive-message", messageData);
      console.log(`Message sent in ${room} by ${username}: ${message}`);
    });

    // ✅ Handle user typing indicators
    socket.on("typing", ({ room, isTyping }) => {
      if (validRooms.has(room) && socket.rooms.has(room)) {
        const username = socket.data.username;
        socket.to(room).emit("user-typing", { username, isTyping });
      }
    });

    // ✅ Handle disconnection
    socket.on("disconnect", () => {
      const username = socket.data.username;
      const room = socket.data.room;
      
      if (room && username) {
        // Remove user from room users set
        roomUsers.get(room)?.delete(username);
        
        // Notify others in the room
        socket.to(room).emit("receive-message", {
          userId: "System",
          text: `${username} left the chat.`,
          timestamp: Date.now(),
          type: "system"
        });

        // Update room users count
        const userCount = roomUsers.get(room)?.size || 0;
        socket.to(room).emit("room-users-update", { count: userCount });

        // Clean up empty rooms
        if (userCount === 0) {
          validRooms.delete(room);
          roomUsers.delete(room);
          console.log(`Room ${room} deleted (empty)`);
        }
      }

      console.log(`Socket disconnected: ${socket.id}`);
    });

    // ✅ Handle leaving room manually
    socket.on("leave-room", ({ room }) => {
      const username = socket.data.username;
      
      if (room && username && socket.rooms.has(room)) {
        socket.leave(room);
        roomUsers.get(room)?.delete(username);
        
        socket.to(room).emit("receive-message", {
          userId: "System",
          text: `${username} left the chat.`,
          timestamp: Date.now(),
          type: "system"
        });

        const userCount = roomUsers.get(room)?.size || 0;
        socket.to(room).emit("room-users-update", { count: userCount });
        
        socket.data.room = null;
      }
    });
  });

  console.log("✅ Enhanced Socket.IO server started with room validation");
  res.end();
};

export default SocketHandler;