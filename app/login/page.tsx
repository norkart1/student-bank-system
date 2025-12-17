"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col px-6 py-8">
      <Link href="/">
        <div className="w-10 h-10 bg-[#4a6670] rounded-full flex items-center justify-center hover:bg-[#3d565e] transition-colors mb-8">
          <ArrowLeft className="w-5 h-5 text-white" />
        </div>
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[#171532] leading-tight">
          Hey,<br />Welcome Back
        </h1>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 flex-1">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
            <Mail className="w-5 h-5" />
          </div>
          <Input
            type="text"
            placeholder="Enter your email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="h-14 pl-12 bg-white border border-[#e5e7eb] rounded-xl text-[#171532] placeholder:text-[#9ca3af] focus:ring-2 focus:ring-[#4a6670]/30 focus:border-[#4a6670]"
          />
        </div>

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
            <Lock className="w-5 h-5" />
          </div>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-14 pl-12 pr-12 bg-white border border-[#e5e7eb] rounded-xl text-[#171532] placeholder:text-[#9ca3af] focus:ring-2 focus:ring-[#4a6670]/30 focus:border-[#4a6670]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#4a6670] transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex justify-end py-1">
          <button type="button" className="text-sm text-[#4a6670] font-medium hover:underline">
            Forgot Password?
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl text-center">
            {error}
          </div>
        )}
      </form>

      <div className="mt-auto pt-8 space-y-4">
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full h-14 bg-[#4a6670] hover:bg-[#3d565e] text-white text-lg font-semibold rounded-2xl shadow-lg transition-all duration-300 disabled:opacity-70"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-[#9ca3af] text-sm">Or Continue with</p>

        <div className="flex justify-center gap-4">
          <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all border border-[#e5e7eb]">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
          <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all border border-[#e5e7eb]">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
              <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
              <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
              <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/>
            </svg>
          </button>
          <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all border border-[#e5e7eb]">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
          </button>
        </div>

        <p className="text-center text-[#747384] text-sm pt-2">
          Don't have an Account? <span className="text-[#4a6670] font-semibold cursor-pointer hover:underline">Sign-Up</span>
        </p>

        <div className="pt-4 border-t border-[#e5e7eb] mt-4">
          <p className="text-center text-xs text-[#9ca3af] mb-2">Demo Credentials</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl text-center border border-[#e5e7eb]">
              <p className="font-semibold text-[#4a6670]">Admin</p>
              <p className="text-[#747384]">admin / 12345</p>
            </div>
            <div className="bg-white p-3 rounded-xl text-center border border-[#e5e7eb]">
              <p className="font-semibold text-[#7056B2]">User</p>
              <p className="text-[#747384]">user / 12345</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
