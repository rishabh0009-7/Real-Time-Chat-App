import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  userId: string;
  text: string;
}

export default function useChatSocket(room: string, userId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userCount, setUserCount] = useState<number>(1);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io({
      path: "/api/socketio",
    });

    socketRef.current = socket;

    socket.emit("join-room", { room, name: userId });

    socket.on("receive-message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("user-count", (count: number) => {
      setUserCount(count);
    });

    socket.on("room-invalid", () => {
      alert("❌ Invalid room code!");
      window.location.href = "/chat";
    });

    return () => {
      socket.disconnect();
    };
  }, [room, userId]);

  const sendMessage = (text: string) => {
    if (socketRef.current) {
      socketRef.current.emit("send-message", { room, message: text });
    }
  };

  return { messages, sendMessage, userCount };
}
