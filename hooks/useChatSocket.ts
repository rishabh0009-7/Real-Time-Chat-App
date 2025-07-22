import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  userId: string;
  text: string;
}

export default function useChatSocket(room: string, userId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io({
      path: "/api/socketio",
    });

    socketRef.current = socket;

    // Join the specified room
    socket.emit("join-room", { room, name: userId });

    // Listen for incoming messages
    socket.on("receive-message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [room, userId]);

  // Send message to the room
  const sendMessage = (text: string) => {
    if (socketRef.current) {
      socketRef.current.emit("send-message", { room, message: text });
    }
  };

  return { messages, sendMessage };
}
