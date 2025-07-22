import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

interface Message {
  userId: string;
  text: string;
  timestamp?: number;
  type?: "user" | "system";
}

interface TypingUser {
  username: string;
  isTyping: boolean;
}

export default function useChatSocket(room: string, userId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [userCount, setUserCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const socket = io({
      path: "/api/socketio",
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
      // Join the specified room
      socket.emit("join-room", { room, name: userId });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    // Room validation error
    socket.on("room-error", (error: string) => {
      console.error("Room error:", error);
      setRoomError(error);
      toast.error(error);
    });

    // Message events
    socket.on("receive-message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("message-error", (error: string) => {
      toast.error(error);
    });

    // Room updates
    socket.on("room-users-update", ({ count }: { count: number }) => {
      setUserCount(count);
    });

    // Typing indicators
    socket.on("user-typing", ({ username, isTyping }: TypingUser) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.includes(username) ? prev : [...prev, username];
        } else {
          return prev.filter((user) => user !== username);
        }
      });
    });

    // Cleanup function
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.disconnect();
    };
  }, [room, userId]);

  // Send message to the room
  const sendMessage = useCallback((text: string) => {
    if (socketRef.current && isConnected && !roomError) {
      socketRef.current.emit("send-message", { room, message: text });
      
      // Stop typing indicator when message is sent
      socketRef.current.emit("typing", { room, isTyping: false });
    }
  }, [room, isConnected, roomError]);

  // Handle typing indicators
  const handleTyping = useCallback((isTyping: boolean) => {
    if (socketRef.current && isConnected && !roomError) {
      socketRef.current.emit("typing", { room, isTyping });

      // Auto-stop typing after 3 seconds of inactivity
      if (isTyping) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          if (socketRef.current) {
            socketRef.current.emit("typing", { room, isTyping: false });
          }
        }, 3000);
      }
    }
  }, [room, isConnected, roomError]);

  // Leave room manually
  const leaveRoom = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("leave-room", { room });
    }
  }, [room, isConnected]);

  return { 
    messages, 
    sendMessage, 
    isConnected, 
    roomError,
    userCount,
    typingUsers,
    handleTyping,
    leaveRoom
  };
}