"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { PWAInstall } from "@/components/pwa-install"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-slate-900 flex flex-col items-center justify-center px-6 py-8">
      <PWAInstall />
      <div className="flex flex-col items-center max-w-md w-full">
        <div className="relative w-full max-w-[320px] mb-10 flex items-center justify-center">
          <Image 
            src="/students.png" 
            alt="Students" 
            width={320} 
            height={320}
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Welcome to <span className="text-[#f84b4b]">JDSA Students Bank</span>
          </h1>
        </div>

        <div className="flex gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-slate-200"></div>
          <div className="w-6 h-2 rounded-full bg-[#f84b4b]"></div>
          <div className="w-2 h-2 rounded-full bg-slate-200"></div>
        </div>

        <Link href="/login" className="w-full">
          <button className="w-full h-14 bg-[#f84b4b] hover:bg-[#e43d3d] text-white text-lg font-semibold rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
            Find Your Account
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
      </div>
    </div>
  )
}
