"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { User, Lock, Eye, EyeOff, ArrowLeft, Check } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    setTimeout(() => {
      if (username === "admin" && password === "12345") {
        localStorage.setItem("isAdminAuthenticated", "true")
        localStorage.setItem("userRole", "admin")
        router.push("/admin/dashboard")
      } else if (username === "user" && password === "12345") {
        localStorage.setItem("isUserAuthenticated", "true")
        localStorage.setItem("userRole", "user")
        router.push("/user/dashboard")
      } else {
        setError("Invalid username or password")
        setIsLoading(false)
      }
    }, 500)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="relative">
        <div className="h-48 md:h-56 bg-gradient-to-br from-[#261863] via-[#55389B] to-[#7056B2] relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-4 left-8 w-32 h-32 bg-[#8462E1] rounded-full blur-3xl"></div>
            <div className="absolute top-12 right-4 w-24 h-24 bg-[#D975BB] rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-1/2 w-40 h-20 bg-[#A855F7] rounded-full blur-3xl"></div>
          </div>
          
          <Link href="/" className="absolute top-4 left-4 z-20">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </div>
          </Link>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </div>

      <div className="flex-1 px-6 md:px-8 -mt-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#171532] mb-2">Welcome Back</h1>
            <p className="text-[#747384]">Login to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7056B2]">
                <User className="w-5 h-5" />
              </div>
              <Input
                type="text"
                placeholder="Full Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-14 pl-12 bg-[#f4f0fa] border-0 rounded-xl text-[#171532] placeholder:text-[#A8A3C1] focus:ring-2 focus:ring-[#7056B2]/30"
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7056B2]">
                <Lock className="w-5 h-5" />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-14 pl-12 pr-12 bg-[#f4f0fa] border-0 rounded-xl text-[#171532] placeholder:text-[#A8A3C1] focus:ring-2 focus:ring-[#7056B2]/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7056B2] hover:text-[#55389B] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <div 
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${rememberMe ? 'bg-[#7056B2]' : 'bg-[#f4f0fa] border border-[#A8A3C1]'}`}
                >
                  {rememberMe && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm text-[#747384]">Remember Me</span>
              </label>
              <button type="button" className="text-sm text-[#7056B2] font-medium hover:underline">
                Forgot Password ?
              </button>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-[#55389B] to-[#7056B2] hover:from-[#7056B2] hover:to-[#8462E1] text-white text-lg font-semibold rounded-full shadow-lg shadow-[#7056B2]/30 transition-all duration-300 disabled:opacity-70"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center mt-6 text-[#747384]">
            Don't have account? <span className="text-[#7056B2] font-semibold underline cursor-pointer">Sign up</span>
          </p>

          <div className="mt-8 pt-6 border-t border-[#e2e0ec]">
            <p className="text-center text-xs text-[#A8A3C1] mb-3">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#f4f0fa] p-3 rounded-xl text-center">
                <p className="font-semibold text-[#7056B2]">Admin</p>
                <p className="text-[#747384]">admin / 12345</p>
              </div>
              <div className="bg-[#f4f0fa] p-3 rounded-xl text-center">
                <p className="font-semibold text-[#D975BB]">User</p>
                <p className="text-[#747384]">user / 12345</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
