"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useChatSocket from "@/hooks/useChatSocket";
import { StarsBackground } from "@/components/animate-ui/backgrounds/stars";

export default function ChatPage({ params }: { params: { roomcode: string } }) {
  const searchParams = useSearchParams();
  const userName = searchParams.get("name") || "Anonymous";

  const { messages, sendMessage, userCount } = useChatSocket(params.roomcode, userName);
  const [text, setText] = useState("");
  const messageListRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (text.trim() === "") return;
    sendMessage(text);
    setText("");
  };

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center overflow-hidden px-4 py-8">
      <StarsBackground className="absolute inset-0 z-0" />

      <div className="relative z-10 w-full max-w-xl bg-zinc-900 rounded-2xl shadow-xl border border-zinc-700 p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            💬 Chat Room: <span className="text-blue-400">{params.roomcode}</span>
          </h1>
          <p className="text-sm text-gray-400">{userCount} users in room</p>
        </div>

        <div
          ref={messageListRef}
          className="h-[400px] overflow-y-auto bg-zinc-800 rounded-lg p-4 space-y-3 border border-zinc-700 shadow-inner"
        >
          {messages.map((msg, idx) => (
            <div key={idx} className={msg.userId === userName ? "text-right" : "text-left"}>
              <p className="text-sm text-gray-400 font-medium">{msg.userId}</p>
              <p className="text-base text-white">{msg.text}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 px-4 py-2 rounded-md bg-zinc-800 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-sm font-semibold shadow-md"
          >
            🚀 Send
          </button>
        </div>
      </div>
    </div>
  );
}
