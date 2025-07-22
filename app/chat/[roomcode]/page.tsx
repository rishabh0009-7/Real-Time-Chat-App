"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useChatSocket from "@/hooks/useChatSocket";

export default function ChatRoomPage() {
  const router = useRouter();
  const roomCode = router.query?.roomcode as string;
  const [name, setName] = useState("");
  const [input, setInput] = useState("");

  const { messages, sendMessage } = useChatSocket(roomCode || "", name);

 

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      <h1 className="text-xl font-bold mb-2">
        Room Code: <span className="text-blue-600">{roomCode}</span>
      </h1>

      <div className="flex-1 overflow-y-auto bg-white rounded-md shadow p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${
              msg.user === name ? "text-right" : "text-left"
            }`}
          >
            <p className="text-sm text-gray-600">
              <strong>{msg.user}</strong>
            </p>
            <p className="text-base">{msg.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 border rounded-md px-4 py-2"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Send
        </button>
      </div>
    </div>
  );
}
