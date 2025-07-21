"use client";

import { Button } from "@/components/ui/button";
import { StarsBackground } from "@/components/animate-ui/backgrounds/stars";
import { useState } from "react";
import { toast } from "sonner"
import { Toaster } from "sonner";


export default function Chat() {
    const [userName , setUserName] = useState("")
    const [roomCode, setRoomCode] = useState("")
    const [codeInput , setcodeInput ] = useState("")


    function generateRoomCode(){
        const newCode =  Math.random().toString(36).substring(2, 8).toUpperCase()
        setRoomCode(newCode)
        toast.success("room code generated ")

    }

  const copyToClipboard =  async ()=>{


    try {
        await navigator.clipboard.writeText(roomCode)
        toast.success("copied to clipboard !")
        
    } catch (error) {
        toast.error("Failed to copy ")
        
    }



  }

const handleJoinForm = (e:React.FormEvent)=>{
        e.preventDefault();
        toast.success("A User has joined the room ")


       

       




    }


  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-20 space-y-10 font-sans overflow-hidden">
      {/* Background */}
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


      {/* Foreground Content */}
      <div className="relative z-10 w-full max-w-md bg-zinc-900 rounded-2xl shadow-2xl p-8 space-y-6 border border-zinc-700">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-white drop-shadow">
          🔐 Join a Chat Room
        </h2>

        <form className="space-y-4"  onSubmit={handleJoinForm}>
          <input
            type="text"
            placeholder="Enter Your Name"
            value = {userName}
            onChange= {(e)=>setUserName(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <input
            type="text"
            placeholder="Enter Room Code"
            value = {codeInput}
            onChange={(e)=>setcodeInput(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg py-3 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105">
            🚪 Join Room
          </Button>
        </form>
      </div>

      <div className="relative z-10 pt-4">
        <Button
        onClick={generateRoomCode}
         className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white text-lg px-8 py-3 rounded-full font-semibold shadow-lg transition-transform duration-300 ease-in-out hover:scale-105">
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
        className="w-full bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-md mt-2"
      >
        📋 Copy to Clipboard
      </Button>
    </div>
  </div>
)}



     
    </div>
  );
}
