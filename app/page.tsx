"use client"

import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f5f0e8] flex flex-col px-6 py-12 relative overflow-hidden">
      {/* Decorative sun rays - left side */}
      <div className="absolute left-8 top-40 opacity-30">
        <svg width="80" height="80" viewBox="0 0 80 80" className="text-[#f4c430]">
          <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="40" y1="10" x2="40" y2="30" />
            <line x1="40" y1="50" x2="40" y2="70" />
            <line x1="10" y1="40" x2="30" y2="40" />
            <line x1="50" y1="40" x2="70" y2="40" />
            <line x1="18" y1="18" x2="32" y2="32" />
            <line x1="48" y1="48" x2="62" y2="62" />
            <line x1="62" y1="18" x2="48" y2="32" />
            <line x1="32" y1="48" x2="18" y2="62" />
          </g>
        </svg>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center flex-1 max-w-2xl mx-auto w-full relative z-10">
        {/* Student illustration */}
        <div className="mb-8 md:mb-12">
          <Image 
            src="/students.png" 
            alt="Students" 
            width={240} 
            height={240}
            style={{ width: 'auto', height: 'auto' }}
            priority
            className="drop-shadow-lg"
          />
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-[#171532] mb-2">
            JDSA Students <span className="text-[#9b59b6]">Bank</span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#4a6670]">
            Your Financial Journey Starts Here
          </h2>
        </div>

        {/* Description text */}
        <p className="text-center text-[#5a6c78] text-lg md:text-xl leading-relaxed mb-10 max-w-md">
          Empowering students with Islamic-guided financial management and banking services. Learn to manage your money with integrity, knowledge, and faith.
        </p>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Link href="/login" className="flex-1 md:flex-none">
            <button className="w-full px-8 py-4 bg-[#f4c430] hover:bg-[#e6b800] text-black text-lg font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
              Click to Dive In
              <span className="text-xl">→</span>
            </button>
          </Link>
          
          <button className="flex-1 md:flex-none px-8 py-4 bg-[#c800a9] hover:bg-[#a90088] text-white text-lg font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
            Learn More
            <span className="text-xl">♪</span>
          </button>
        </div>
      </div>

      {/* Decorative wavy bottom */}
      <svg className="absolute bottom-0 left-0 w-full h-32 opacity-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,50 Q300,100 600,50 T1200,50 L1200,120 L0,120 Z" fill="#2d7a8a" opacity="0.5"></path>
        <path d="M0,60 Q300,110 600,60 T1200,60 L1200,120 L0,120 Z" fill="#1e5a6f" opacity="0.7"></path>
      </svg>
    </div>
  )
}
