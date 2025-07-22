"use client";

import { Button } from "@/components/ui/button";
import { StarsBackground } from "@/components/animate-ui/backgrounds/stars";
import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";

export default function Chat() {
  const [userName, setUserName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const router = useRouter();

  function generateRoomCode() {
    setIsCreatingRoom(true);
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Connect to socket to register the room
    const socket = io({
      path: "/api/socketio",
    });

    socket.on("connect", () => {
      // Create room on server
      socket.emit("create-room", newCode);
    });

    socket.on("room-created", (code: string) => {
      setRoomCode(code);
      setIsCreatingRoom(false);
      toast.success("Room code generated and registered!");
      socket.disconnect();
    });

    socket.on("connect_error", () => {
      setIsCreatingRoom(false);
      toast.error("Failed to create room. Please try again.");
      socket.disconnect();
    });

    // Fallback timeout
    setTimeout(() => {
      if (isCreatingRoom) {
        setRoomCode(newCode);
        setIsCreatingRoom(false);
        toast.success("Room code generated!");
        socket.disconnect();
      }
    }, 3000);
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

    if (!userName.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    if (!codeInput.trim()) {
      toast.error("Please enter a room code.");
      return;
    }

    // Basic format validation
    const cleanCode = codeInput.trim().toUpperCase();
    if (cleanCode.length < 4 || cleanCode.length > 8) {
      toast.error("Please enter a valid room code.");
      return;
    }

    // Redirect to chat room - validation will happen on the server
    router.push(`/chat/${cleanCode}?name=${encodeURIComponent(userName.trim())}`);
  };

  const handleJoinCreatedRoom = () => {
    if (!userName.trim()) {
      toast.error("Please enter your name first.");
      return;
    }

    if (!roomCode) {
      toast.error("No room code available. Please create a room first.");
      return;
    }

    router.push(`/chat/${roomCode}?name=${encodeURIComponent(userName.trim())}`);
  };

  // Clear room code when component unmounts or page refreshes
  useEffect(() => {
    const handleBeforeUnload = () => {
      setRoomCode("");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

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
            maxLength={50}
          />
          <input
            type="text"
            placeholder="Enter Room Code"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 text-white rounded-lg uppercase tracking-widest"
            maxLength={8}
          />
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
            disabled={!userName.trim() || !codeInput.trim()}
          >
            🚀 Join Room
          </Button>
        </form>
      </div>

      <div className="relative z-10 pt-4">
        <Button
          onClick={generateRoomCode}
          disabled={isCreatingRoom}
          className="bg-gradient-to-r from-pink-600 to-red-600 text-white px-8 py-3 rounded-full disabled:opacity-50"
        >
          {isCreatingRoom ? "⏳ Creating..." : "✨ Create Room"}
        </Button>
      </div>

      {roomCode && (
        <div className="relative z-10 pt-2">
          <div className="mt-2 px-6 py-3 bg-zinc-800 text-white rounded-xl border border-zinc-600 shadow-lg space-y-2 text-center">
            <div className="text-lg font-mono tracking-widest">{roomCode}</div>
            <div className="flex gap-2">
              <Button
                onClick={copyToClipboard}
                variant="secondary"
                className="flex-1 bg-zinc-700 hover:bg-zinc-600"
              >
                📋 Copy to Clipboard
              </Button>
              <Button
                onClick={handleJoinCreatedRoom}
                disabled={!userName.trim()}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                🚀 Join This Room
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}