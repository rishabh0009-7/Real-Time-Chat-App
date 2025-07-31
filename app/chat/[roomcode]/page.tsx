"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useChatSocket from "@/hooks/useChatSocket";
import { StarsBackground } from "@/components/animate-ui/backgrounds/stars";
import { toast } from "sonner"; // Assuming sonner is installed

// Updated interface to match Next.js 15 App Router requirements
interface ChatPageProps {
  params: Promise<{
    roomcode: string;
  }>;
  // If your page also received `searchParams`, you would add them here:
  // searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userName = searchParams?.get("name") || "Anonymous";

  // State to hold the resolved params
  const [roomcode, setRoomcode] = useState<string>("");
  const [paramsLoaded, setParamsLoaded] = useState(false);

  // Resolve the params Promise
  useEffect(() => {
    params.then((resolvedParams) => {
      setRoomcode(resolvedParams.roomcode);
      setParamsLoaded(true);
    });
  }, [params]);

  const {
    messages,
    sendMessage,
    isConnected,
    roomError,
    userCount,
    typingUsers,
    handleTyping,
    // leaveRoom is not currently used in this component's render or effects.
    // If you intend to use it (e.g., for a "Leave Chat" button), uncomment it.
    // leaveRoom
  } = useChatSocket(roomcode, userName);

  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (text.trim() === "" || !isConnected || roomError) return;

    sendMessage(text);
    setText("");
    setIsTyping(false);
    handleTyping(false); // Make sure typing state is reset on send
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);

    // Handle typing indicators
    if (e.target.value.length > 0 && !isTyping) {
      setIsTyping(true);
      handleTyping(true);
    } else if (e.target.value.length === 0 && isTyping) {
      setIsTyping(false);
      handleTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  // Use toast for room errors and redirect
  useEffect(() => {
    if (roomError) {
      // Show toast notification for the error
      toast.error("Room Error", {
        description: roomError,
        duration: 3000, // Display for 3 seconds
      });

      const timer = setTimeout(() => {
        router.push('/');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [roomError, router]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current && !roomError) {
      inputRef.current.focus();
    }
  }, [roomError]);

  // Show loading state while params are being resolved
  if (!paramsLoaded) {
    return (
      <div className="relative min-h-screen bg-black text-white flex items-center justify-center overflow-hidden px-4 py-8">
        <StarsBackground className="absolute inset-0 z-0" />
        <div className="relative z-10 w-full max-w-xl bg-zinc-900 rounded-2xl shadow-xl border border-zinc-700 p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-gray-300">Initializing chat room...</p>
        </div>
      </div>
    );
  }

  // Show error state if room is invalid (This conditional return is allowed AFTER all hooks)
  if (roomError) {
    return (
      <div className="relative min-h-screen bg-black text-white flex items-center justify-center overflow-hidden px-4 py-8">
        <StarsBackground className="absolute inset-0 z-0" />
        <div className="relative z-10 w-full max-w-xl bg-zinc-900 rounded-2xl shadow-xl border border-red-500 p-6 text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">❌ Room Access Denied</h1>
          <p className="text-gray-300 mb-4">{roomError}</p>
          <p className="text-sm text-gray-400">Redirecting to home page in 3 seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center overflow-hidden px-4 py-8">
      <StarsBackground className="absolute inset-0 z-0" />

      <div className="relative z-10 w-full max-w-xl bg-zinc-900 rounded-2xl shadow-xl border border-zinc-700 p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            💬 Chat Room: <span className="text-blue-400">{roomcode}</span>
          </h1>
          <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-400">
            <span className={`flex items-center gap-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            <span>👥 {userCount} user{userCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div
          ref={messageListRef}
          className="h-[400px] overflow-y-auto bg-zinc-800 rounded-lg p-4 space-y-3 border border-zinc-700 shadow-inner"
        >
          {messages.map((msg, idx) => (
            <div key={idx} className={msg.userId === userName ? "text-right" : "text-left"}>
              <p className={`text-sm font-medium ${
                msg.type === "system"
                  ? "text-yellow-400 text-center italic"
                  : msg.userId === userName
                    ? "text-blue-400"
                    : "text-gray-400"
              }`}>
                {msg.type === "system" ? "" : msg.userId}
              </p>
              <p className={`text-base ${
                msg.type === "system"
                  ? "text-yellow-300 text-center italic"
                  : "text-white"
              }`}>
                {msg.text}
              </p>
            </div>
          ))}

          {/* Typing indicators */}
          {typingUsers.length > 0 && (
            <div className="text-left">
              <p className="text-sm text-gray-500 italic">
                {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={text}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={!isConnected || !!roomError}
            className="flex-1 px-4 py-2 rounded-md bg-zinc-800 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
          />
          <button
            onClick={handleSend}
            disabled={!isConnected || !!roomError || text.trim() === ""}
            className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-sm font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚀 Send
          </button>
        </div>
      </div>
    </div>
  );
}