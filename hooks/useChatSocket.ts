// hooks/useChatSocket.ts
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

// Defined message type
type ChatMessage = {
  user: string;
  text: string;
};

export default function useChatSocket(roomCode: string, name: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(); 
    socketRef.current = socket;

    // Join the chat room with name
    socket.emit("join-room", { room: roomCode, name });

    // Receive message
    socket.on("receive-message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

//  display when someone joins
    socket.on("user-joined", (notice: string) => {
      setMessages((prev) => [...prev, { user: "System", text: notice }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomCode, name]);

  // Send message to room
  const sendMessage = (message: string) => {
    socketRef.current?.emit("send-message", { room: roomCode, message });
  };

  return { messages, sendMessage };
}
