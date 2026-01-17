"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-slate-900 flex flex-col items-center justify-center px-6 py-8">
      <div className="flex flex-col items-center max-w-md w-full">
        <div className="relative w-full max-w-[320px] mb-10 flex items-center justify-center">
          <Image 
            src="/masjid.png" 
            alt="Masjid" 
            width={320} 
            height={320}
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#171532] dark:text-white">
            Welcome to <span className="text-[#7056B2]">JDSA Students Bank</span>
          </h1>
        </div>

        <div className="flex gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-[#c9c9ce]"></div>
          <div className="w-6 h-2 rounded-full bg-[#4a6670]"></div>
          <div className="w-2 h-2 rounded-full bg-[#c9c9ce]"></div>
        </div>

        <Link href="/login" className="w-full">
          <button className="w-full h-14 bg-[#4a6670] hover:bg-[#3d565e] dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-lg font-semibold rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
            Find Your Account
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
      </div>
    </div>
  )
}
