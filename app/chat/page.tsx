"use client";

import { Button } from "@/components/ui/button";
import { StarsBackground } from "@/components/animate-ui/backgrounds/stars";
import { useState } from "react";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";

export default function Chat() {
  const [userName, setUserName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [codeInput, setcodeInput] = useState("");

  const router = useRouter();

  function generateRoomCode() {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(newCode);
    toast.success("Room code generated!");
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy.");
    }
  };

  const handleJoinForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName || !codeInput) {
      toast.error("Please enter both your name and room code.");
      return;
    }

    router.push(`/chat/${codeInput.trim().toUpperCase()}?name=${encodeURIComponent(userName)}`);
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-20 space-y-10 font-sans overflow-hidden">
      <StarsBackground className="absolute inset-0 z-0" />
      <Toaster
        richColors
        position="bottom-right"
        theme="dark"
        toastOptions={{
          className: "bg-zinc-900 text-white border border-zinc-700 shadow-lg",
          style: {
            background: "#18181b",
            color: "#f4f4f5",
            border: "1px solid #3f3f46",
          },
        }}
      />
      <div className="relative z-10 w-full max-w-md bg-zinc-900 rounded-2xl shadow-2xl p-8 space-y-6 border border-zinc-700">
        <h2 className="text-3xl sm:text-4xl font-bold text-center">🔐 Join a Chat Room</h2>

        <form className="space-y-4" onSubmit={handleJoinForm}>
          <input
            type="text"
            placeholder="Enter Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 text-white rounded-lg"
          />
          <input
            type="text"
            placeholder="Enter Room Code"
            value={codeInput}
            onChange={(e) => setcodeInput(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 text-white rounded-lg uppercase tracking-widest"
          />
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            🚀 Join Room
          </Button>
        </form>
      </div>

      <div className="relative z-10 pt-4">
        <Button
          onClick={generateRoomCode}
          className="bg-gradient-to-r from-pink-600 to-red-600 text-white px-8 py-3 rounded-full"
        >
          ✨ Create Room
        </Button>
      </div>

      {roomCode && (
        <div className="relative z-10 pt-2">
          <div className="mt-2 px-6 py-3 bg-zinc-800 text-white rounded-xl border border-zinc-600 shadow-lg space-y-2 text-center">
            <div className="text-lg font-mono tracking-widest">{roomCode}</div>
            <Button
              onClick={copyToClipboard}
              variant="secondary"
              className="w-full bg-zinc-700 hover:bg-zinc-600"
            >
              📋 Copy to Clipboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
