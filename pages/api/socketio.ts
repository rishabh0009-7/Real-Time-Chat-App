import { Server as SocketIOServer, Socket } from "socket.io"; // Alias Server to avoid conflict with Node.js http.Server
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from 'http'; // Import Node.js http server type

// 1. Define the type for the Node.js server with the attached Socket.IO instance
interface SocketServer extends HTTPServer {
  io?: SocketIOServer;
}

// 2. Extend NextApiResponse to include the socket with the typed server
interface NextApiResponseWithSocket extends NextApiResponse {
  socket: {
    server: SocketServer;
  };
}

// 3. Define custom data for the socket, extending Socket.IO's default Socket
interface CustomSocketData {
  username?: string;
  room?: string;
}

// 4. Create an extended Socket type with our custom data
interface CustomSocket extends Socket {
  data: CustomSocketData;
}

// 5. Define interfaces for the data payloads of your Socket.IO events
interface CreateRoomPayload {
  roomCode: string;
}

interface JoinRoomPayload {
  room: string;
  name: string;
}

interface SendMessagePayload {
  room: string;
  message: string;
}

interface TypingPayload {
  room: string;
  isTyping: boolean;
}

interface MessageData {
  userId: string;
  text: string;
  timestamp: number;
  type: 'system' | 'user';
}

interface RoomUsersUpdatePayload {
  count: number;
}

interface RoomErrorPayload {
  message: string;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

// In-memory storage for valid rooms (in production, use Redis/Database)
const validRooms = new Set<string>();
const roomUsers = new Map<string, Set<string>>();

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => { // Use our extended response type
  // Check if Socket.IO server is already initialized on this server instance
  if (res.socket.server.io) {
    res.end(); // If it is, just end the response for this API call
    return;
  }

  // Initialize a new Socket.IO server instance, attaching it to the Node.js HTTP server
  const io = new SocketIOServer(res.socket.server, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin: "*", // Adjust this to your client's origin in production for security
      methods: ["GET", "POST"]
    }
  });

  // Store the Socket.IO server instance on the Node.js server object for future requests
  res.socket.server.io = io;

  io.on("connection", (socket: CustomSocket) => { // Use CustomSocket for the connected socket
    console.log(`Socket connected: ${socket.id}`);

    // ✅ Create a new room
    socket.on("create-room", (roomCode: string) => { // Type the roomCode parameter
      validRooms.add(roomCode);
      roomUsers.set(roomCode, new Set());
      console.log(`Room created: ${roomCode}`);
      socket.emit("room-created", roomCode);
    });

    // ✅ Validate and join room
    socket.on("join-room", ({ room, name }: JoinRoomPayload) => { // Type the payload
      // Check if room exists in valid rooms
      if (!validRooms.has(room)) {
        socket.emit("room-error", "Invalid room code. Please use a generated room code.");
        return;
      }

      socket.join(room);
      socket.data.username = name; // Assign to typed socket.data
      socket.data.room = room;     // Assign to typed socket.data

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
      } as MessageData); // Cast to MessageData

      // Send current room users count
      const userCount = roomUsers.get(room)?.size || 0;
      io.to(room).emit("room-users-update", { count: userCount } as RoomUsersUpdatePayload); // Cast to RoomUsersUpdatePayload

      console.log(`${name} joined room: ${room}`);
    });

    // ✅ Send message with enhanced validation
    socket.on("send-message", ({ room, message }: SendMessagePayload) => { // Type the payload
      // Validate room exists and user is in the room
      if (!validRooms.has(room) || !socket.rooms.has(room)) {
        socket.emit("message-error", "Cannot send message to invalid room.");
        return;
      }

      const username = socket.data.username || "Anonymous";
      const messageData: MessageData = { // Explicitly type messageData
        userId: username,
        text: message.trim(),
        timestamp: Date.now(),
        type: "user"
      };

      io.to(room).emit("receive-message", messageData);
      console.log(`Message sent in ${room} by ${username}: ${message}`);
    });

    // ✅ Handle user typing indicators
    socket.on("typing", ({ room, isTyping }: TypingPayload) => { // Type the payload
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
        } as MessageData);

        // Update room users count
        const userCount = roomUsers.get(room)?.size || 0;
        socket.to(room).emit("room-users-update", { count: userCount } as RoomUsersUpdatePayload);

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
    socket.on("leave-room", ({ room }: LeaveRoomPayload) => { // Type the payload
      const username = socket.data.username;

      if (room && username && socket.rooms.has(room)) {
        socket.leave(room);
        roomUsers.get(room)?.delete(username);

        socket.to(room).emit("receive-message", {
          userId: "System",
          text: `${username} left the chat.`,
          timestamp: Date.now(),
          type: "system"
        } as MessageData);

        const userCount = roomUsers.get(room)?.size || 0;
        socket.to(room).emit("room-users-update", { count: userCount } as RoomUsersUpdatePayload);

        socket.data.room = undefined; // Set back to undefined or null
      }
    });
  });

  console.log("✅ Enhanced Socket.IO server started with room validation");
  res.end();
};

export default SocketHandler;
