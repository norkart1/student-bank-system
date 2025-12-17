"use client"

import Link from "next/link"
import { Users, GraduationCap, BookOpen } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center px-6 py-8">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full">
        <div className="relative w-full aspect-square max-w-[320px] mb-8 flex items-center justify-center">
          <div className="relative flex items-end justify-center gap-2">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#7056B2] to-[#55389B] rounded-full flex items-center justify-center mb-2 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="w-20 h-32 bg-gradient-to-b from-[#5a9e8f] to-[#4a8a7c] rounded-t-3xl rounded-b-lg relative">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#f8e4d0] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-6 h-16 bg-[#5a9e8f] rounded-full"></div>
                <div className="absolute bottom-0 right-0 w-6 h-16 bg-[#5a9e8f] rounded-full"></div>
              </div>
            </div>
            
            <div className="flex flex-col items-center -mt-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[#D975BB] to-[#c45a9f] rounded-full flex items-center justify-center mb-2 shadow-lg">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div className="w-24 h-40 bg-gradient-to-b from-[#f5a623] to-[#e09000] rounded-t-3xl rounded-b-lg relative">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-14 bg-[#f8e4d0] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-7 h-20 bg-[#f5a623] rounded-full"></div>
                <div className="absolute bottom-0 right-0 w-7 h-20 bg-[#f5a623] rounded-full"></div>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8462E1] to-[#7056B2] rounded-full flex items-center justify-center mb-2 shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="w-20 h-32 bg-gradient-to-b from-[#5a9e8f] to-[#4a8a7c] rounded-t-3xl rounded-b-lg relative">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#8b6243] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-6 h-16 bg-[#5a9e8f] rounded-full"></div>
                <div className="absolute bottom-0 right-0 w-6 h-16 bg-[#5a9e8f] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#171532]">
            Welcome to <span className="text-[#7056B2]">JDSA Students Bank</span>
          </h1>
        </div>

        <div className="flex gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-[#c9c9ce]"></div>
          <div className="w-6 h-2 rounded-full bg-[#4a6670]"></div>
          <div className="w-2 h-2 rounded-full bg-[#c9c9ce]"></div>
        </div>
      </div>

      <Link href="/login" className="w-full max-w-md">
        <button className="w-full h-14 bg-[#4a6670] hover:bg-[#3d565e] text-white text-lg font-semibold rounded-2xl shadow-lg transition-all duration-300">
          Get Started
        </button>
      </Link>
    </div>
  )
}
