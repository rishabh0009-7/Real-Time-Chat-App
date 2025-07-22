import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StarsBackground } from "@/components/animate-ui/backgrounds/stars";
import { WritingText } from "@/components/animate-ui/text/writing";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Stars */}
      <StarsBackground className="absolute inset-0 z-0" />

      {/* Foreground Content */}
      <div className="relative z-10 max-w-2xl w-full text-center px-6 py-20 space-y-12">
        {/* Emoji */}
        <div className="text-7xl sm:text-8xl hover:scale-110 transition-transform duration-300 ease-out">
          💬
        </div>

        {/* Title */}
        
          <WritingText
            className="block text-5xl sm:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
            text="Real-Time Chat App"
          
          />
        

        {/* Description */}
        <p className="text-lg sm:text-xl text-gray-300 leading-relaxed tracking-wide opacity-100 transition-opacity duration-1000 delay-500">
  Create private chat rooms with one-time codes. Chats vanish once the room closes.
</p>


        {/* Call to Action */}
        <Link href="/chat">
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg px-8 py-4 rounded-full font-semibold shadow-lg transition-transform duration-300 ease-in-out hover:scale-105">
            🚀 Start Chatting
          </Button>
        </Link>
      </div>
    </main>
  );
}