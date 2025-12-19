"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function Home() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-slate-900 flex flex-col items-center justify-center px-6 py-8 relative">
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="absolute top-6 right-6 p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600" />
        )}
      </button>

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
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
      </div>
    </div>
  )
}
