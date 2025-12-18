"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col md:flex-row">
      {/* Image Section */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-b from-[#2a5f6f] to-[#1a3f4f] items-center justify-center p-8">
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src="/islamic-mosque.jpg"
            alt="Islamic artwork"
            width={600}
            height={800}
            className="object-cover rounded-2xl shadow-2xl max-h-96"
            priority
          />
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full md:w-1/2 flex flex-col px-6 md:px-12 py-8 md:py-16 justify-start md:justify-center relative overflow-hidden">
        {/* Islamic geometric pattern background - subtle */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
          <svg viewBox="0 0 200 200" className="text-[#4a6670]">
            <defs>
              <pattern id="islamic-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="currentColor" />
                <circle cx="20" cy="10" r="2" fill="currentColor" />
                <circle cx="30" cy="10" r="2" fill="currentColor" />
                <circle cx="10" cy="20" r="2" fill="currentColor" />
                <circle cx="30" cy="20" r="2" fill="currentColor" />
                <circle cx="20" cy="30" r="2" fill="currentColor" />
                <line x1="10" y1="10" x2="20" y2="20" stroke="currentColor" strokeWidth="0.5" />
                <line x1="20" y1="10" x2="30" y2="20" stroke="currentColor" strokeWidth="0.5" />
                <line x1="20" y1="30" x2="30" y2="20" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#islamic-pattern)" />
          </svg>
        </div>

        {/* Islamic decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#4a6670] to-transparent opacity-30"></div>

        {/* Islamic crescent and star decoration - top right */}
        <div className="hidden md:block absolute top-8 right-8 text-[#4a6670] opacity-20">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
            <path d="M20 5 L24 15 L35 15 L27 22 L30 32 L20 26 L10 32 L13 22 L5 15 L16 15 Z" />
            <circle cx="15" cy="18" r="3" fill="#4a6670" opacity="0.5" />
          </svg>
        </div>

        {/* Islamic arch decoration - mobile only */}
        <div className="md:hidden absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#4a6670]/5 to-transparent rounded-b-3xl"></div>

        <Link href="/">
          <div className="w-10 h-10 bg-[#4a6670] rounded-full flex items-center justify-center hover:bg-[#3d565e] transition-colors mb-8 relative z-10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </div>
        </Link>

        <div className="mb-10 relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#171532] leading-tight">
            Hey,<br />Welcome Back
          </h1>
          <p className="text-sm text-[#4a6670] mt-2 opacity-70">Islamic Banking Solutions</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 max-w-md">
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

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-[#4a6670] hover:bg-[#3d565e] text-white text-lg font-semibold rounded-2xl shadow-lg transition-all duration-300 disabled:opacity-70 mt-6"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  )
}
