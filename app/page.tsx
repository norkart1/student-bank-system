"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Wallet, CreditCard, PiggyBank, TrendingUp, Coins, DollarSign } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8e0f0] via-[#d4c8e8] to-[#c9b8e0] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#d4c8e8] rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#c9b8e0] rounded-full opacity-60 blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md w-full mx-auto">
        <div className="relative w-full max-w-[320px] md:max-w-[400px] aspect-[3/4] mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[#261863] via-[#1e1b3a] to-[#171532] rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-48 h-32 md:w-56 md:h-36 bg-white/10 rounded-[2rem] backdrop-blur-sm"></div>
                
                <div className="relative z-10 flex gap-1 items-end">
                  <div className="w-3 md:w-4 h-12 md:h-16 bg-[#7056B2] rounded-sm"></div>
                  <div className="w-3 md:w-4 h-16 md:h-20 bg-[#D975BB] rounded-sm"></div>
                  <div className="w-3 md:w-4 h-10 md:h-14 bg-[#7056B2] rounded-sm"></div>
                  <div className="w-3 md:w-4 h-20 md:h-24 bg-[#D975BB] rounded-sm"></div>
                  <div className="w-3 md:w-4 h-14 md:h-18 bg-[#7056B2] rounded-sm"></div>
                  <div className="w-3 md:w-4 h-8 md:h-12 bg-[#D975BB] rounded-sm"></div>
                </div>
              </div>
            </div>

            <div className="absolute top-6 left-4 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            
            <div className="absolute top-12 right-6 w-9 h-9 md:w-11 md:h-11 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-full flex items-center justify-center shadow-lg">
              <Coins className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            
            <div className="absolute top-24 left-8 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#8462E1] to-[#7056B2] rounded-full flex items-center justify-center shadow-lg">
              <Wallet className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            
            <div className="absolute top-20 right-4 w-7 h-7 md:w-9 md:h-9 bg-gradient-to-br from-[#EC4899] to-[#D946EF] rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
              <PiggyBank className="w-3 h-3 md:w-4 md:h-4 text-white" />
            </div>
            
            <div className="absolute bottom-28 left-6 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#06B6D4] to-[#0891B2] rounded-full flex items-center justify-center shadow-lg">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            
            <div className="absolute bottom-20 right-8 w-9 h-9 md:w-11 md:h-11 bg-gradient-to-br from-[#A855F7] to-[#9333EA] rounded-full flex items-center justify-center shadow-lg animate-pulse" style={{ animationDuration: '2s' }}>
              <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>

            <div className="absolute bottom-24 left-1/4 w-16 h-10 md:w-20 md:h-12 bg-gradient-to-r from-[#F472B6]/60 to-[#F9A8D4]/60 rounded-full blur-sm"></div>
            <div className="absolute top-28 right-1/4 w-12 h-8 md:w-16 md:h-10 bg-gradient-to-r from-[#C4B5FD]/60 to-[#DDD6FE]/60 rounded-full blur-sm"></div>
            
            <div className="absolute top-4 left-1/3 w-4 h-4 bg-[#FDE047] rounded-full shadow-lg"></div>
            <div className="absolute bottom-32 right-1/3 w-3 h-3 bg-[#A78BFA] rounded-full shadow-lg"></div>
            <div className="absolute top-1/4 left-2 w-2 h-2 bg-[#F472B6] rounded-full"></div>
          </div>
        </div>

        <div className="text-center mb-8 px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#171532] leading-tight">
            JDSA<br />
            <span className="text-[#7056B2]">Students Bank</span>
          </h1>
        </div>

        <Link href="/login" className="w-full max-w-xs">
          <Button 
            size="lg" 
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-[#7056B2] to-[#55389B] hover:from-[#8462E1] hover:to-[#7056B2] text-white rounded-full shadow-lg shadow-[#7056B2]/30 gap-2 transition-all duration-300 hover:scale-105"
          >
            <ArrowRight className="w-5 h-5" />
            Get Started
          </Button>
        </Link>
      </div>

      <footer className="absolute bottom-4 text-center text-sm text-[#747384]">
        © 2025 JDSA Students Bank
      </footer>
    </div>
  )
}
