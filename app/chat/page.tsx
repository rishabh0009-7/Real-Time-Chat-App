"use client";

import { Button } from "@/components/ui/button";
import { StarsBackground } from "@/components/animate-ui/backgrounds/stars";

export default function Chat() {
  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-20 space-y-10 font-sans overflow-hidden">
      {/* Background */}
      <StarsBackground className="absolute inset-0 z-0" />

      {/* Foreground Content */}
      <div className="relative z-10 w-full max-w-md bg-zinc-900 rounded-2xl shadow-2xl p-8 space-y-6 border border-zinc-700">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-white drop-shadow">
          🔐 Join a Chat Room
        </h2>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Enter Your Name"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <input
            type="text"
            placeholder="Enter Room Code"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg py-3 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105">
            🚪 Join Room
          </Button>
        </form>
      </div>

      <div className="relative z-10 pt-4">
        <Button className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white text-lg px-8 py-3 rounded-full font-semibold shadow-lg transition-transform duration-300 ease-in-out hover:scale-105">
          ✨ Create Room
        </Button>
      </div>
    </div>
  );
}
